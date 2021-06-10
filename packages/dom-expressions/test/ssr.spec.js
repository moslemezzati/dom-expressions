import * as r from "../src/server";
import * as S from "s-js";

const fixture = `<div id="main" data-id="12" aria-role="button" checked class="selected" style="color:red"><h1 custom-attr="1" disabled title="Hello John" style="background-color:red" class="selected"><a href="/">Welcome</a></h1></div>`;
const fixture2 = `<span> Hello &lt;div/> </span>`;

const Comp1 = () => {
  const selected = S.data(true),
    welcoming = S.data("Hello John"),
    color = S.data("red"),
    results = {
      "data-id": "12",
      "aria-role": "button",
      get checked() {
        return selected();
      }
    },
    dynamic = () => ({
      "custom-attr": "1"
    });

  return r.ssr`<div id="main" ${r.ssrSpread(results, false, true)} class="${r.ssrClassList({
    selected: selected()
  })}" style="${r.ssrStyle({
    color: color()
  })}"${r.ssrBoolean("disabled", !selected())}><h1 ${r.ssrSpread(
    () => dynamic(),
    false,
    true
  )}${r.ssrBoolean("disabled", selected())} title="${() => welcoming()}" style="${() =>
    r.ssrStyle({
      "background-color": color()
    })}" class="${() =>
    r.ssrClassList({
      selected: selected()
    })}"><a href="/">Welcome</a></h1></div>`;
};

const Comp2 = () => {
  const greeting = "Hello",
    name = "<div/>";
  return r.ssr`<span> ${r.escape(greeting)} ${r.escape(name)} </span>`;
};

describe("renderToString", () => {
  it("renders as expected", async () => {
    let res = r.renderToString(Comp1);
    expect(res.html).toBe(fixture);
    res = r.renderToString(Comp2, { nonce: "1a2s3d4f5g" });
    expect(res.html).toBe(fixture2);
    expect(res.script.includes("1a2s3d4f5g")).toBeTruthy();
  });
});

describe("pipeToNodeWritable", () => {
  it("renders as expected", done => {
    const chunks = [];
    r.pipeToNodeWritable(
      Comp2,
      {
        write(v) {
          chunks.push(v);
        },
        end() {
          expect(chunks.join("")).toBe(fixture2);
          done();
        }
      },
      { nonce: "1a2s3d4f5g" }
    );
  });
});

// describe("renderToWebStream", () => {
//   function streamToString (stream) {
//     const chunks = []
//     const reader = stream.getReader()
//     return reader.read().then(function processText({ done, value }) {
//       if (done) return chunks.join("");
//       chunks.push(value);
//       return reader.read().then(processText);
//     });
//   }
//   it("renders as expected", async () => {
//     let res = await streamToString(r.renderToWebStream(Comp2));
//     expect(res).toBe(fixture2);
//   });
// });
