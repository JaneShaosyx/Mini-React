// writing our own createElement method
// React.createElement usage:
// const element = React.createElement(
//     "div",
//     { id: "foo" },
//     React.createElement("a", null, "bar"),
//     React.createElement("b")
//   )

function createElement(type, props, ...children) {
    return {
        type: type,
        props: {
            ...props,
            children: children.map(child => typeof child === "object" ? child : createTextElement(child))
        }
    };
}

// children can be primitive type: e.g String
function createTextElement(text) {
    return {
        type: "TEXT_ELEMENT",
        props: {
            nodeValue: text,
            children: []
        }
    };
}

// name our library as Didact
const Didact = { createElement };

// using our library
const element = Didact.createElement(
    "div",
    { id: "foo" },
    Didact.createElement("a", null, "bar"),
    Didact.createElement("b")
);

// tell babel using the function we defined while still using jsx
/** @jsx Didact.createElement */
const element = (
    <div id="foo">
        <a>bar</a>
        <b />
    </div>
);

const container = document.getElementById("root");
// ReactDOM.render(element,container);