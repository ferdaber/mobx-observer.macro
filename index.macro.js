const { createMacro } = require("babel-plugin-macros");

function assert(assertion, errorMessage) {
  if (!assertion) throw new Error(errorMessage);
}

module.exports = createMacro(({ babel, references }) => {
  let didAddImportToModule = false;
  const t = babel.types;
  references.default.forEach((path) => {
    // inside a function component, it'll be something like:
    // Component() { useObserver() } which means:
    // CallExpression => ExpressionStatement => BlockStatement => Function/ArrowFunctionDeclaration

    // TODO: MAYBE LATER inside a class component, it'll be something like:
    // class MyComponent extends React.Component { render() { useObserver() } }
    // CallExpression => ExpressionStatement => BlockStatement => Function/ArrowFunctionDeclaration (check it's called render) => ClassDeclaration
    assert(
      t.isCallExpression(path.parentPath),
      "This macro can only be called as a custom hook funtion."
    );
    const macroCallPath = path.parentPath;
    let fnComponentPath = macroCallPath.getFunctionParent();
    assert(
      fnComponentPath,
      "This macro must be called inside a function component declaration."
    );

    path.getStatementParent();

    // remove the macro call
    if (t.isArrowFunctionExpression(macroCallPath.parentPath.node)) {
      // this is an edge case where this is the only thing being called by an arrow function
      // const foo = () => useObserver();
      macroCallPath.parentPath.node.body = t.blockStatement([]);
    } else {
      // otherwise it's safe to just remove the call statement
      macroCallPath.remove();
    }

    // wrap function component declaration with observer HOC
    let fnComponentNode = fnComponentPath.node;
    if (t.isFunctionDeclaration(fnComponentNode)) {
      const id = fnComponentNode.id;
      const fnComponentAsExpression = t.functionExpression(
        id,
        fnComponentNode.params,
        fnComponentNode.body
      );
      const wrappedCallExpression = t.callExpression(t.identifier("observer"), [
        fnComponentAsExpression,
      ]);
      fnComponentPath.replaceWith(
        t.variableDeclaration("const", [
          t.variableDeclarator(id, wrappedCallExpression),
        ])
      );
    } else {
      fnComponentPath.replaceWith(
        t.callExpression(t.identifier("observer"), [fnComponentNode])
      );
    }

    // add import statement if it's not there already
    // we assume mobx-react-lite because we only support hooks-based function component
    if (didAddImportToModule) return;
    // if 'observer' is already in scope we assume that it's the one from mobx-react-lite
    if (fnComponentPath.scope.hasBinding("observer", true)) {
      return (didAddImportToModule = true);
    }
    const programPath = path.findParent((path) => t.isProgram(path));
    /** @type {import('@types/babel__traverse').NodePath<import('@babel/types').ImportDeclaration>} */
    let lastImportStatement;
    let importStatementAlreadyExists = false;
    programPath.traverse({
      ImportDeclaration(path) {
        const source = path.get("source").node.value;
        const specifiers = path.get("specifiers");
        if (
          // TODO: make source configurable
          source === "mobx-react-lite" &&
          specifiers.some(
            (p) => t.isImportSpecifier(p) || t.isImportDefaultSpecifier(p)
          )
        ) {
          lastImportStatement = path;
          importStatementAlreadyExists = true;
        } else if (!importStatementAlreadyExists) {
          lastImportStatement = path;
        }
      },
    });

    const id = t.identifier("observer");
    const specifier = t.importSpecifier(id, id);
    if (importStatementAlreadyExists) {
      lastImportStatement.node.specifiers.push(specifier);
    } else if (lastImportStatement) {
      lastImportStatement.replaceWithMultiple([
        lastImportStatement.node,
        t.importDeclaration([specifier], t.stringLiteral("mobx-react-lite")),
      ]);
    }
    didAddImportToModule = true;
  });
});
