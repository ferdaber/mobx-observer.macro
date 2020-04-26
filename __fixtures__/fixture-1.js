import useObserver from "./index.macro";
import * as Mobx from "mobx-react-lite";
import def, { someImport } from "mobx-react-lite";
import "mobx-react-lite";

function MyComponent(props) {
  useObserver();
  return <div />;
}

(function (props) {
  useObserver();
});

const a = someHoc((props, ref) => {
  useObserver(), (<div />);
});

const b = () => (useObserver(), (<div />));
const c = () => useObserver();
