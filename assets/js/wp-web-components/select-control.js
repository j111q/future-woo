/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const U = globalThis, J = U.ShadowRoot && (U.ShadyCSS === void 0 || U.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, G = Symbol(), ee = /* @__PURE__ */ new WeakMap();
let de = class {
  constructor(e, t, i) {
    if (this._$cssResult$ = !0, i !== G) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = t;
  }
  get styleSheet() {
    let e = this.o;
    const t = this.t;
    if (J && e === void 0) {
      const i = t !== void 0 && t.length === 1;
      i && (e = ee.get(t)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), i && ee.set(t, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const xe = (r) => new de(typeof r == "string" ? r : r + "", void 0, G), N = (r, ...e) => {
  const t = r.length === 1 ? r[0] : e.reduce((i, s, n) => i + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s) + r[n + 1], r[0]);
  return new de(t, r, G);
}, _e = (r, e) => {
  if (J) r.adoptedStyleSheets = e.map((t) => t instanceof CSSStyleSheet ? t : t.styleSheet);
  else for (const t of e) {
    const i = document.createElement("style"), s = U.litNonce;
    s !== void 0 && i.setAttribute("nonce", s), i.textContent = t.cssText, r.appendChild(i);
  }
}, te = J ? (r) => r : (r) => r instanceof CSSStyleSheet ? ((e) => {
  let t = "";
  for (const i of e.cssRules) t += i.cssText;
  return xe(t);
})(r) : r;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: ye, defineProperty: ve, getOwnPropertyDescriptor: $e, getOwnPropertyNames: we, getOwnPropertySymbols: Ae, getPrototypeOf: Se } = Object, m = globalThis, ie = m.trustedTypes, ke = ie ? ie.emptyScript : "", F = m.reactiveElementPolyfillSupport, P = (r, e) => r, W = { toAttribute(r, e) {
  switch (e) {
    case Boolean:
      r = r ? ke : null;
      break;
    case Object:
    case Array:
      r = r == null ? r : JSON.stringify(r);
  }
  return r;
}, fromAttribute(r, e) {
  let t = r;
  switch (e) {
    case Boolean:
      t = r !== null;
      break;
    case Number:
      t = r === null ? null : Number(r);
      break;
    case Object:
    case Array:
      try {
        t = JSON.parse(r);
      } catch {
        t = null;
      }
  }
  return t;
} }, ue = (r, e) => !ye(r, e), se = { attribute: !0, type: String, converter: W, reflect: !1, useDefault: !1, hasChanged: ue };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), m.litPropertyMetadata ?? (m.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let k = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ?? (this.l = [])).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, t = se) {
    if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
      const i = Symbol(), s = this.getPropertyDescriptor(e, i, t);
      s !== void 0 && ve(this.prototype, e, s);
    }
  }
  static getPropertyDescriptor(e, t, i) {
    const { get: s, set: n } = $e(this.prototype, e) ?? { get() {
      return this[t];
    }, set(o) {
      this[t] = o;
    } };
    return { get: s, set(o) {
      const h = s == null ? void 0 : s.call(this);
      n == null || n.call(this, o), this.requestUpdate(e, h, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? se;
  }
  static _$Ei() {
    if (this.hasOwnProperty(P("elementProperties"))) return;
    const e = Se(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(P("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(P("properties"))) {
      const t = this.properties, i = [...we(t), ...Ae(t)];
      for (const s of i) this.createProperty(s, t[s]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const t = litPropertyMetadata.get(e);
      if (t !== void 0) for (const [i, s] of t) this.elementProperties.set(i, s);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t, i] of this.elementProperties) {
      const s = this._$Eu(t, i);
      s !== void 0 && this._$Eh.set(s, t);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const t = [];
    if (Array.isArray(e)) {
      const i = new Set(e.flat(1 / 0).reverse());
      for (const s of i) t.unshift(te(s));
    } else e !== void 0 && t.push(te(e));
    return t;
  }
  static _$Eu(e, t) {
    const i = t.attribute;
    return i === !1 ? void 0 : typeof i == "string" ? i : typeof e == "string" ? e.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    var e;
    this._$ES = new Promise((t) => this.enableUpdating = t), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), (e = this.constructor.l) == null || e.forEach((t) => t(this));
  }
  addController(e) {
    var t;
    (this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(e), this.renderRoot !== void 0 && this.isConnected && ((t = e.hostConnected) == null || t.call(e));
  }
  removeController(e) {
    var t;
    (t = this._$EO) == null || t.delete(e);
  }
  _$E_() {
    const e = /* @__PURE__ */ new Map(), t = this.constructor.elementProperties;
    for (const i of t.keys()) this.hasOwnProperty(i) && (e.set(i, this[i]), delete this[i]);
    e.size > 0 && (this._$Ep = e);
  }
  createRenderRoot() {
    const e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return _e(e, this.constructor.elementStyles), e;
  }
  connectedCallback() {
    var e;
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), (e = this._$EO) == null || e.forEach((t) => {
      var i;
      return (i = t.hostConnected) == null ? void 0 : i.call(t);
    });
  }
  enableUpdating(e) {
  }
  disconnectedCallback() {
    var e;
    (e = this._$EO) == null || e.forEach((t) => {
      var i;
      return (i = t.hostDisconnected) == null ? void 0 : i.call(t);
    });
  }
  attributeChangedCallback(e, t, i) {
    this._$AK(e, i);
  }
  _$ET(e, t) {
    var n;
    const i = this.constructor.elementProperties.get(e), s = this.constructor._$Eu(e, i);
    if (s !== void 0 && i.reflect === !0) {
      const o = (((n = i.converter) == null ? void 0 : n.toAttribute) !== void 0 ? i.converter : W).toAttribute(t, i.type);
      this._$Em = e, o == null ? this.removeAttribute(s) : this.setAttribute(s, o), this._$Em = null;
    }
  }
  _$AK(e, t) {
    var n, o;
    const i = this.constructor, s = i._$Eh.get(e);
    if (s !== void 0 && this._$Em !== s) {
      const h = i.getPropertyOptions(s), a = typeof h.converter == "function" ? { fromAttribute: h.converter } : ((n = h.converter) == null ? void 0 : n.fromAttribute) !== void 0 ? h.converter : W;
      this._$Em = s;
      const p = a.fromAttribute(t, h.type);
      this[s] = p ?? ((o = this._$Ej) == null ? void 0 : o.get(s)) ?? p, this._$Em = null;
    }
  }
  requestUpdate(e, t, i, s = !1, n) {
    var o;
    if (e !== void 0) {
      const h = this.constructor;
      if (s === !1 && (n = this[e]), i ?? (i = h.getPropertyOptions(e)), !((i.hasChanged ?? ue)(n, t) || i.useDefault && i.reflect && n === ((o = this._$Ej) == null ? void 0 : o.get(e)) && !this.hasAttribute(h._$Eu(e, i)))) return;
      this.C(e, t, i);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, t, { useDefault: i, reflect: s, wrapped: n }, o) {
    i && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(e) && (this._$Ej.set(e, o ?? t ?? this[e]), n !== !0 || o !== void 0) || (this._$AL.has(e) || (this.hasUpdated || i || (t = void 0), this._$AL.set(e, t)), s === !0 && this._$Em !== e && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(e));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (t) {
      Promise.reject(t);
    }
    const e = this.scheduleUpdate();
    return e != null && await e, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    var i;
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [n, o] of this._$Ep) this[n] = o;
        this._$Ep = void 0;
      }
      const s = this.constructor.elementProperties;
      if (s.size > 0) for (const [n, o] of s) {
        const { wrapped: h } = o, a = this[n];
        h !== !0 || this._$AL.has(n) || a === void 0 || this.C(n, void 0, o, a);
      }
    }
    let e = !1;
    const t = this._$AL;
    try {
      e = this.shouldUpdate(t), e ? (this.willUpdate(t), (i = this._$EO) == null || i.forEach((s) => {
        var n;
        return (n = s.hostUpdate) == null ? void 0 : n.call(s);
      }), this.update(t)) : this._$EM();
    } catch (s) {
      throw e = !1, this._$EM(), s;
    }
    e && this._$AE(t);
  }
  willUpdate(e) {
  }
  _$AE(e) {
    var t;
    (t = this._$EO) == null || t.forEach((i) => {
      var s;
      return (s = i.hostUpdated) == null ? void 0 : s.call(i);
    }), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(e) {
    return !0;
  }
  update(e) {
    this._$Eq && (this._$Eq = this._$Eq.forEach((t) => this._$ET(t, this[t]))), this._$EM();
  }
  updated(e) {
  }
  firstUpdated(e) {
  }
};
k.elementStyles = [], k.shadowRootOptions = { mode: "open" }, k[P("elementProperties")] = /* @__PURE__ */ new Map(), k[P("finalized")] = /* @__PURE__ */ new Map(), F == null || F({ ReactiveElement: k }), (m.reactiveElementVersions ?? (m.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const O = globalThis, re = (r) => r, I = O.trustedTypes, oe = I ? I.createPolicy("lit-html", { createHTML: (r) => r }) : void 0, be = "$lit$", g = `lit$${Math.random().toFixed(9).slice(2)}$`, fe = "?" + g, Ee = `<${fe}>`, S = document, R = () => S.createComment(""), D = (r) => r === null || typeof r != "object" && typeof r != "function", Q = Array.isArray, Ce = (r) => Q(r) || typeof (r == null ? void 0 : r[Symbol.iterator]) == "function", V = `[
\f\r]`, z = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, ne = /-->/g, ae = />/g, _ = RegExp(`>|${V}(?:([^\\s"'>=/]+)(${V}*=${V}*(?:[^
\f\r"'\`<>=]|("|')|))|$)`, "g"), le = /'/g, he = /"/g, ge = /^(?:script|style|textarea|title)$/i, ze = (r) => (e, ...t) => ({ _$litType$: r, strings: e, values: t }), u = ze(1), E = Symbol.for("lit-noChange"), l = Symbol.for("lit-nothing"), ce = /* @__PURE__ */ new WeakMap(), w = S.createTreeWalker(S, 129);
function me(r, e) {
  if (!Q(r) || !r.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return oe !== void 0 ? oe.createHTML(e) : e;
}
const Pe = (r, e) => {
  const t = r.length - 1, i = [];
  let s, n = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", o = z;
  for (let h = 0; h < t; h++) {
    const a = r[h];
    let p, d, c = -1, b = 0;
    for (; b < a.length && (o.lastIndex = b, d = o.exec(a), d !== null); ) b = o.lastIndex, o === z ? d[1] === "!--" ? o = ne : d[1] !== void 0 ? o = ae : d[2] !== void 0 ? (ge.test(d[2]) && (s = RegExp("</" + d[2], "g")), o = _) : d[3] !== void 0 && (o = _) : o === _ ? d[0] === ">" ? (o = s ?? z, c = -1) : d[1] === void 0 ? c = -2 : (c = o.lastIndex - d[2].length, p = d[1], o = d[3] === void 0 ? _ : d[3] === '"' ? he : le) : o === he || o === le ? o = _ : o === ne || o === ae ? o = z : (o = _, s = void 0);
    const f = o === _ && r[h + 1].startsWith("/>") ? " " : "";
    n += o === z ? a + Ee : c >= 0 ? (i.push(p), a.slice(0, c) + be + a.slice(c) + g + f) : a + g + (c === -2 ? h : f);
  }
  return [me(r, n + (r[t] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), i];
};
class T {
  constructor({ strings: e, _$litType$: t }, i) {
    let s;
    this.parts = [];
    let n = 0, o = 0;
    const h = e.length - 1, a = this.parts, [p, d] = Pe(e, t);
    if (this.el = T.createElement(p, i), w.currentNode = this.el.content, t === 2 || t === 3) {
      const c = this.el.content.firstChild;
      c.replaceWith(...c.childNodes);
    }
    for (; (s = w.nextNode()) !== null && a.length < h; ) {
      if (s.nodeType === 1) {
        if (s.hasAttributes()) for (const c of s.getAttributeNames()) if (c.endsWith(be)) {
          const b = d[o++], f = s.getAttribute(c).split(g), H = /([.?@])?(.*)/.exec(b);
          a.push({ type: 1, index: n, name: H[2], strings: f, ctor: H[1] === "." ? Re : H[1] === "?" ? De : H[1] === "@" ? Te : L }), s.removeAttribute(c);
        } else c.startsWith(g) && (a.push({ type: 6, index: n }), s.removeAttribute(c));
        if (ge.test(s.tagName)) {
          const c = s.textContent.split(g), b = c.length - 1;
          if (b > 0) {
            s.textContent = I ? I.emptyScript : "";
            for (let f = 0; f < b; f++) s.append(c[f], R()), w.nextNode(), a.push({ type: 2, index: ++n });
            s.append(c[b], R());
          }
        }
      } else if (s.nodeType === 8) if (s.data === fe) a.push({ type: 2, index: n });
      else {
        let c = -1;
        for (; (c = s.data.indexOf(g, c + 1)) !== -1; ) a.push({ type: 7, index: n }), c += g.length - 1;
      }
      n++;
    }
  }
  static createElement(e, t) {
    const i = S.createElement("template");
    return i.innerHTML = e, i;
  }
}
function C(r, e, t = r, i) {
  var o, h;
  if (e === E) return e;
  let s = i !== void 0 ? (o = t._$Co) == null ? void 0 : o[i] : t._$Cl;
  const n = D(e) ? void 0 : e._$litDirective$;
  return (s == null ? void 0 : s.constructor) !== n && ((h = s == null ? void 0 : s._$AO) == null || h.call(s, !1), n === void 0 ? s = void 0 : (s = new n(r), s._$AT(r, t, i)), i !== void 0 ? (t._$Co ?? (t._$Co = []))[i] = s : t._$Cl = s), s !== void 0 && (e = C(r, s._$AS(r, e.values), s, i)), e;
}
class Oe {
  constructor(e, t) {
    this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = t;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(e) {
    const { el: { content: t }, parts: i } = this._$AD, s = ((e == null ? void 0 : e.creationScope) ?? S).importNode(t, !0);
    w.currentNode = s;
    let n = w.nextNode(), o = 0, h = 0, a = i[0];
    for (; a !== void 0; ) {
      if (o === a.index) {
        let p;
        a.type === 2 ? p = new M(n, n.nextSibling, this, e) : a.type === 1 ? p = new a.ctor(n, a.name, a.strings, this, e) : a.type === 6 && (p = new Me(n, this, e)), this._$AV.push(p), a = i[++h];
      }
      o !== (a == null ? void 0 : a.index) && (n = w.nextNode(), o++);
    }
    return w.currentNode = S, s;
  }
  p(e) {
    let t = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(e, i, t), t += i.strings.length - 2) : i._$AI(e[t])), t++;
  }
}
class M {
  get _$AU() {
    var e;
    return ((e = this._$AM) == null ? void 0 : e._$AU) ?? this._$Cv;
  }
  constructor(e, t, i, s) {
    this.type = 2, this._$AH = l, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = i, this.options = s, this._$Cv = (s == null ? void 0 : s.isConnected) ?? !0;
  }
  get parentNode() {
    let e = this._$AA.parentNode;
    const t = this._$AM;
    return t !== void 0 && (e == null ? void 0 : e.nodeType) === 11 && (e = t.parentNode), e;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(e, t = this) {
    e = C(this, e, t), D(e) ? e === l || e == null || e === "" ? (this._$AH !== l && this._$AR(), this._$AH = l) : e !== this._$AH && e !== E && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : Ce(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== l && D(this._$AH) ? this._$AA.nextSibling.data = e : this.T(S.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    var n;
    const { values: t, _$litType$: i } = e, s = typeof i == "number" ? this._$AC(e) : (i.el === void 0 && (i.el = T.createElement(me(i.h, i.h[0]), this.options)), i);
    if (((n = this._$AH) == null ? void 0 : n._$AD) === s) this._$AH.p(t);
    else {
      const o = new Oe(s, this), h = o.u(this.options);
      o.p(t), this.T(h), this._$AH = o;
    }
  }
  _$AC(e) {
    let t = ce.get(e.strings);
    return t === void 0 && ce.set(e.strings, t = new T(e)), t;
  }
  k(e) {
    Q(this._$AH) || (this._$AH = [], this._$AR());
    const t = this._$AH;
    let i, s = 0;
    for (const n of e) s === t.length ? t.push(i = new M(this.O(R()), this.O(R()), this, this.options)) : i = t[s], i._$AI(n), s++;
    s < t.length && (this._$AR(i && i._$AB.nextSibling, s), t.length = s);
  }
  _$AR(e = this._$AA.nextSibling, t) {
    var i;
    for ((i = this._$AP) == null ? void 0 : i.call(this, !1, !0, t); e !== this._$AB; ) {
      const s = re(e).nextSibling;
      re(e).remove(), e = s;
    }
  }
  setConnected(e) {
    var t;
    this._$AM === void 0 && (this._$Cv = e, (t = this._$AP) == null || t.call(this, e));
  }
}
class L {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, t, i, s, n) {
    this.type = 1, this._$AH = l, this._$AN = void 0, this.element = e, this.name = t, this._$AM = s, this.options = n, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = l;
  }
  _$AI(e, t = this, i, s) {
    const n = this.strings;
    let o = !1;
    if (n === void 0) e = C(this, e, t, 0), o = !D(e) || e !== this._$AH && e !== E, o && (this._$AH = e);
    else {
      const h = e;
      let a, p;
      for (e = n[0], a = 0; a < n.length - 1; a++) p = C(this, h[i + a], t, a), p === E && (p = this._$AH[a]), o || (o = !D(p) || p !== this._$AH[a]), p === l ? e = l : e !== l && (e += (p ?? "") + n[a + 1]), this._$AH[a] = p;
    }
    o && !s && this.j(e);
  }
  j(e) {
    e === l ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class Re extends L {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === l ? void 0 : e;
  }
}
class De extends L {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== l);
  }
}
class Te extends L {
  constructor(e, t, i, s, n) {
    super(e, t, i, s, n), this.type = 5;
  }
  _$AI(e, t = this) {
    if ((e = C(this, e, t, 0) ?? l) === E) return;
    const i = this._$AH, s = e === l && i !== l || e.capture !== i.capture || e.once !== i.once || e.passive !== i.passive, n = e !== l && (i === l || s);
    s && this.element.removeEventListener(this.name, this, i), n && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    var t;
    typeof this._$AH == "function" ? this._$AH.call(((t = this.options) == null ? void 0 : t.host) ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class Me {
  constructor(e, t, i) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    C(this, e);
  }
}
const q = O.litHtmlPolyfillSupport;
q == null || q(T, M), (O.litHtmlVersions ?? (O.litHtmlVersions = [])).push("3.3.2");
const He = (r, e, t) => {
  const i = (t == null ? void 0 : t.renderBefore) ?? e;
  let s = i._$litPart$;
  if (s === void 0) {
    const n = (t == null ? void 0 : t.renderBefore) ?? null;
    i._$litPart$ = s = new M(e.insertBefore(R(), n), n, void 0, t ?? {});
  }
  return s._$AI(r), s;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const A = globalThis;
class x extends k {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var t;
    const e = super.createRenderRoot();
    return (t = this.renderOptions).renderBefore ?? (t.renderBefore = e.firstChild), e;
  }
  update(e) {
    const t = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = He(t, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    var e;
    super.connectedCallback(), (e = this._$Do) == null || e.setConnected(!0);
  }
  disconnectedCallback() {
    var e;
    super.disconnectedCallback(), (e = this._$Do) == null || e.setConnected(!1);
  }
  render() {
    return E;
  }
}
var pe;
x._$litElement$ = !0, x.finalized = !0, (pe = A.litElementHydrateSupport) == null || pe.call(A, { LitElement: x });
const j = A.litElementPolyfillSupport;
j == null || j({ LitElement: x });
(A.litElementVersions ?? (A.litElementVersions = [])).push("4.2.2");
const Ue = N`
	:host {
		display: block;
		box-sizing: border-box;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
			Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
		font-size: 13px;
	}

	*,
	*::before,
	*::after {
		box-sizing: inherit;
	}

	/* ---- Root layout ---- */

	.root {
		display: flex;
		flex-direction: column;
		gap: 0;
		position: relative;
	}

	/* Label positions */
	:host( [label-position='bottom'] ) .root {
		flex-direction: column-reverse;
	}

	:host( [label-position='side'] ) .root {
		flex-direction: row;
		align-items: center;
		gap: 8px;
	}

	:host( [label-position='edge'] ) .root {
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
	}

	:host( [label-position='side'] ) .label {
		width: max( 80px, 30% );
		flex-shrink: 0;
	}

	/* ---- Label ---- */

	.label {
		display: block;
		margin-bottom: 8px;
		font-size: 11px;
		font-weight: 499;
		line-height: 1.4;
		text-transform: uppercase;
	}

	:host( [label-position='side'] ) .label,
	:host( [label-position='edge'] ) .label {
		margin-bottom: 0;
	}

	:host( [label-position='bottom'] ) .label {
		margin-bottom: 0;
		margin-top: 8px;
	}

	/* Visually hidden label */
	.visually-hidden {
		border: 0;
		clip: rect( 1px, 1px, 1px, 1px );
		clip-path: inset( 50% );
		height: 1px;
		margin: -1px;
		overflow: hidden;
		padding: 0;
		position: absolute;
		width: 1px;
		word-wrap: normal !important;
	}

	/* ---- InputBase border container ---- */

	/*
	 * React's InputBase renders the border via an absolutely-positioned
	 * Backdrop div so the border doesn't add to the container height.
	 * We replicate this with an ::after pseudo-element.
	 */
	.input-base {
		display: flex;
		align-items: center;
		position: relative;
		border-radius: 2px;
		background: var( --wp-components-color-background, #fff );
		flex: 1;
		cursor: pointer;
	}

	.input-base::after {
		content: '';
		position: absolute;
		inset: 0;
		border: 1px solid var( --wp-components-color-gray-600, #949494 );
		border-radius: inherit;
		pointer-events: none;
	}

	@media not ( prefers-reduced-motion ) {
		.input-base::after {
			transition: border-color 0.1s ease, box-shadow 0.1s ease;
		}
	}

	.input-base:focus-within::after {
		border-color: var( --wp-components-color-accent, var( --wp-admin-theme-color, #3858e9 ) );
		box-shadow: 0 0 0 0.5px var( --wp-components-color-accent, var( --wp-admin-theme-color, #3858e9 ) );
		outline: 2px solid transparent;
		outline-offset: -2px;
	}

	:host( [disabled] ) .input-base {
		background: var( --wp-components-color-gray-100, #f0f0f0 );
		cursor: default;
	}

	:host( [disabled] ) .input-base::after {
		border-color: var( --wp-components-color-gray-400, #ccc );
	}

	/* Minimal variant */
	:host( [variant='minimal'] ) {
		display: inline-block;
	}

	:host( [variant='minimal'] ) .input-base {
		background: transparent;
		display: inline-flex;
		flex: none;
	}

	:host( [variant='minimal'] ) .input-base::after {
		border-color: transparent;
	}

	:host( [variant='minimal'] ) .input-base:focus-within::after {
		border-color: var( --wp-components-color-accent, var( --wp-admin-theme-color, #3858e9 ) );
	}

	/* ---- Select element ---- */

	select {
		appearance: none;
		background: transparent;
		border: none;
		outline: 0;
		-webkit-tap-highlight-color: rgba( 0, 0, 0, 0 );
		width: 100%;
		color: var( --wp-components-color-foreground, #1e1e1e );
		font-family: inherit;
		font-size: 13px;
		line-height: normal;
		margin: 0;
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
		cursor: pointer;
		box-shadow: none !important;

		/* Default size: 40px height, 12px left pad, 30px right pad (12 + 18) */
		height: 40px;
		padding: 0 30px 0 12px;
	}

	:host( [disabled] ) select {
		color: var( --wp-components-color-gray-600, #949494 );
		cursor: default;
	}

	/* ---- Size variants ---- */

	:host( [size='small'] ) select {
		height: 24px;
		padding: 0 26px 0 8px;
		font-size: 11px;
	}

	:host( [size='compact'] ) select {
		height: 32px;
		padding: 0 26px 0 8px;
	}

	:host( [size='__unstable-large'] ) select {
		height: 40px;
		padding: 0 30px 0 12px;
	}

	/* Multiple mode: no fixed height, symmetric padding */
	:host( [multiple] ) select {
		height: auto;
		overflow: auto;
		padding: 12px 30px 12px 12px;
	}

	:host( [multiple][size='small'] ) select {
		padding: 8px 26px 8px 8px;
	}

	:host( [multiple][size='compact'] ) select {
		padding: 8px 26px 8px 8px;
	}

	/* Minimal variant: field-sizing content, auto width */
	:host( [variant='minimal'] ) select {
		field-sizing: content;
		width: auto;
	}

	/* Mobile font-size override — prevent iOS zoom-on-focus */
	@media ( max-width: 600px ) {
		select {
			font-size: 16px;
		}
	}

	/* ---- Chevron ---- */

	.suffix-wrapper {
		position: absolute;
		right: 0;
		top: 0;
		bottom: 0;
		display: flex;
		align-items: center;
		pointer-events: none;
		/* controlPaddingX = 12 for default / __unstable-large */
		padding-inline-end: 12px;
	}

	:host( [size='small'] ) .suffix-wrapper,
	:host( [size='compact'] ) .suffix-wrapper {
		/* controlPaddingXSmall = 8 for small / compact */
		padding-inline-end: 8px;
	}

	:host( [multiple]:not( [has-suffix] ) ) .suffix-wrapper {
		display: none;
	}

	:host( [multiple] ) .chevron {
		display: none;
	}

	.chevron {
		display: flex;
		align-items: center;
		margin-inline-end: -4px;
		line-height: 0;
	}

	.chevron svg {
		fill: currentColor;
	}

	/* ---- Prefix slot ---- */

	.prefix-wrapper {
		display: flex;
		align-items: center;
		/* controlPaddingX = 12 for default / __unstable-large */
		padding-inline-start: 12px;
	}

	:host( [size='small'] ) .prefix-wrapper,
	:host( [size='compact'] ) .prefix-wrapper {
		/* controlPaddingXSmall = 8 for small / compact */
		padding-inline-start: 8px;
	}

	:host( :not( [has-prefix] ) ) .prefix-wrapper {
		display: none;
	}

	/* ---- Help text ---- */

	.help {
		margin: 8px 0 0;
		font-size: 12px;
		font-style: normal;
		color: var( --wp-components-color-gray-700, #757575 );
	}
`;
let Ie = 0;
const y = class y extends x {
  constructor() {
    super(), this._ariaObserver = null, this._childObserver = null, this.disabled = !1, this.multiple = !1, this.size = "default", this.variant = "default", this.labelPosition = "top", this.hideLabelFromVision = !1, this.required = !1, this._controlId = `select-control-${++Ie}`;
  }
  connectedCallback() {
    super.connectedCallback(), this._ariaObserver = new MutationObserver(() => {
      this._syncAriaAttrs();
    }), this._ariaObserver.observe(this, {
      attributes: !0,
      attributeFilter: y._FORWARDED_ARIA_ATTRS
    }), this._childObserver = new MutationObserver(() => {
      this._syncOptions();
    }), this._childObserver.observe(this, {
      childList: !0,
      subtree: !0,
      characterData: !0,
      attributes: !0,
      attributeFilter: ["value", "disabled", "selected", "label"]
    });
  }
  disconnectedCallback() {
    var e, t;
    super.disconnectedCallback(), (e = this._ariaObserver) == null || e.disconnect(), this._ariaObserver = null, (t = this._childObserver) == null || t.disconnect(), this._childObserver = null;
  }
  firstUpdated() {
    this._syncAriaAttrs(), this._syncOptions();
  }
  updated(e) {
    var i;
    const t = (i = this.shadowRoot) == null ? void 0 : i.querySelector("select");
    t && (e.has("value") && this.value !== void 0 && (t.value = this.value), this._syncAriaDescribedby(t));
  }
  /**
   * Clones light-DOM `<option>` and `<optgroup>` elements into the
   * shadow-DOM `<select>`.
   *
   * Browsers do not support `<slot>` projection inside `<select>` —
   * only direct `<option>`/`<optgroup>` children are rendered by the
   * native dropdown. This method deep-clones the consumer's light-DOM
   * options and inserts them into the shadow `<select>`, preserving
   * the current `value` selection when possible.
   */
  _syncOptions() {
    var i;
    const e = (i = this.shadowRoot) == null ? void 0 : i.querySelector("select");
    if (!e)
      return;
    const t = e.value;
    e.innerHTML = "";
    for (const s of Array.from(this.children))
      (s instanceof HTMLOptionElement || s instanceof HTMLOptGroupElement) && e.appendChild(s.cloneNode(!0));
    this.value !== void 0 ? e.value = this.value : t && (e.value = t);
  }
  /**
   * Forwards ARIA naming attributes from the host element to the
   * internal select so assistive tech can reach them across the
   * shadow boundary.
   */
  _syncAriaAttrs() {
    var t;
    const e = (t = this.shadowRoot) == null ? void 0 : t.querySelector("select");
    if (e)
      for (const i of y._FORWARDED_ARIA_ATTRS) {
        if (i === "aria-describedby") {
          this._syncAriaDescribedby(e);
          continue;
        }
        const s = this.getAttribute(i);
        s ? e.setAttribute(i, s) : e.removeAttribute(i);
      }
  }
  /**
   * Merges the host's `aria-describedby` with the generated help
   * text ID and applies the combined value to the internal select.
   *
   * @param {HTMLSelectElement} select The internal select element.
   */
  _syncAriaDescribedby(e) {
    const t = [];
    this.help && t.push(`${this._controlId}__help`);
    const i = this.getAttribute("aria-describedby");
    i && t.push(...i.split(/\s+/).filter(Boolean)), t.length ? e.setAttribute("aria-describedby", t.join(" ")) : e.removeAttribute("aria-describedby");
  }
  /**
   * Handles prefix slot change to toggle the `has-prefix` attribute.
   *
   * @param {Event} event The slotchange event.
   */
  _onPrefixSlotChange(e) {
    e.target.assignedNodes({ flatten: !0 }).length > 0 ? this.setAttribute("has-prefix", "") : this.removeAttribute("has-prefix");
  }
  /**
   * Handles suffix slot change to toggle the `has-suffix` attribute.
   *
   * @param {Event} event The slotchange event.
   */
  _onSuffixSlotChange(e) {
    e.target.assignedNodes({ flatten: !1 }).length > 0 ? this.setAttribute("has-suffix", "") : this.removeAttribute("has-suffix");
  }
  /**
   * Handles the native select change event. Syncs component state
   * and dispatches a `change` CustomEvent.
   *
   * @param {Event} event The native change event.
   */
  _onChange(e) {
    const t = e.target;
    if (this.multiple) {
      const i = Array.from(
        t.selectedOptions,
        (s) => s.value
      );
      this.dispatchEvent(
        new CustomEvent("change", {
          bubbles: !0,
          composed: !0,
          detail: { value: i }
        })
      );
      return;
    }
    this.value = t.value, this.dispatchEvent(
      new CustomEvent("change", {
        bubbles: !0,
        composed: !0,
        detail: { value: t.value }
      })
    );
  }
  /**
   * Renders the label element.
   */
  _renderLabel() {
    return this.label ? this.hideLabelFromVision ? u`
				<label class="visually-hidden" for=${this._controlId}>${this.label}</label>
			` : u`
			<label class="label" for=${this._controlId} part="label">${this.label}</label>
		` : l;
  }
  /**
   * Renders help text below the control.
   */
  _renderHelp() {
    return this.help ? u`
			<p class="help" id=${`${this._controlId}__help`} part="help">${this.help}</p>
		` : l;
  }
  render() {
    return u`
			<div class="root" part="root">
				${this._renderLabel()}
				<div class="input-base" part="input-base">
					<span class="prefix-wrapper">
						<slot name="prefix" @slotchange=${this._onPrefixSlotChange}></slot>
					</span>
					<select
						id=${this._controlId}
						part="select"
						?disabled=${this.disabled}
						?multiple=${this.multiple}
						?required=${this.required}
						name=${this.name ?? l}
						@change=${this._onChange}
					></select>
					<span class="suffix-wrapper">
						<slot name="suffix" @slotchange=${this._onSuffixSlotChange}>
							<span class="chevron">
								<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="18" height="18" aria-hidden="true">
									<path d="M17.5 11.6L12 16l-5.5-4.4.9-1.2L12 14l4.5-3.6 1 1.2z" />
								</svg>
							</span>
						</slot>
					</span>
				</div>
				${this._renderHelp()}
			</div>
		`;
  }
};
y.styles = Ue, y.properties = {
  label: { type: String, reflect: !0 },
  help: { type: String, reflect: !0 },
  disabled: { type: Boolean, reflect: !0 },
  multiple: { type: Boolean, reflect: !0 },
  size: { type: String, reflect: !0 },
  variant: { type: String, reflect: !0 },
  labelPosition: { type: String, reflect: !0, attribute: "label-position" },
  hideLabelFromVision: { type: Boolean, reflect: !0, attribute: "hide-label-from-vision" },
  value: { type: String, reflect: !0 },
  name: { type: String, reflect: !0 },
  required: { type: Boolean, reflect: !0 }
}, y._FORWARDED_ARIA_ATTRS = [
  "aria-label",
  "aria-labelledby",
  "aria-describedby"
];
let X = y;
customElements.define(
  "wp-components-select-control",
  X
);
const Be = N`
	:host {
		display: block;
		box-sizing: border-box;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
			Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
		font-size: 13px;
	}

	*,
	*::before,
	*::after {
		box-sizing: inherit;
	}

	/* ---- Root layout ---- */

	.root {
		display: flex;
		flex-direction: column;
		gap: 0;
		position: relative;
	}

	/* Label positions */
	:host( [label-position='bottom'] ) .root {
		flex-direction: column-reverse;
	}

	:host( [label-position='side'] ) .root {
		flex-direction: row;
		align-items: center;
		gap: 8px;
	}

	:host( [label-position='edge'] ) .root {
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
	}

	:host( [label-position='side'] ) .label {
		width: max( 80px, 30% );
		flex-shrink: 0;
	}

	/* ---- Label ---- */

	.label {
		display: block;
		margin-bottom: 8px;
		font-size: 11px;
		font-weight: 499;
		line-height: 1.4;
		max-width: calc( 100% - 10px );
		text-transform: uppercase;
	}

	:host( [label-position='side'] ) .label,
	:host( [label-position='edge'] ) .label {
		margin-bottom: 0;
	}

	:host( [label-position='bottom'] ) .label {
		margin-bottom: 0;
		margin-top: 8px;
	}

	/* Visually hidden label */
	.visually-hidden {
		border: 0;
		clip: rect( 1px, 1px, 1px, 1px );
		clip-path: inset( 50% );
		height: 1px;
		margin: -1px;
		overflow: hidden;
		padding: 0;
		position: absolute;
		width: 1px;
		word-wrap: normal !important;
	}

	/* ---- InputBase border container ---- */

	/*
	 * React's InputBase renders the border via an absolutely-positioned
	 * Backdrop div so the border doesn't add to the container height.
	 * We replicate this with an ::after pseudo-element.
	 */
	.input-base {
		display: flex;
		align-items: center;
		position: relative;
		border-radius: 2px;
		background: var( --wp-components-color-background, #fff );
		flex: 1;
	}

	.input-base::after {
		content: '';
		position: absolute;
		inset: 0;
		border: 1px solid var( --wp-components-color-gray-600, #949494 );
		border-radius: inherit;
		pointer-events: none;
	}

	@media not ( prefers-reduced-motion ) {
		.input-base::after {
			transition: border-color 0.1s ease, box-shadow 0.1s ease;
		}
	}

	/*
	 * Focus ring appears on .input-base when <input> has focus, but NOT
	 * when a control inside the prefix/suffix has focus. We use :has()
	 * to exclude prefix/suffix focus events.
	 */
	.input-base:focus-within:not(
		:has( :is( .prefix-wrapper, .suffix-wrapper ):focus-within )
	)::after {
		border-color: var(
			--wp-components-color-accent,
			var( --wp-admin-theme-color, #3858e9 )
		);
		box-shadow: 0 0 0 0.5px
			var(
				--wp-components-color-accent,
				var( --wp-admin-theme-color, #3858e9 )
			);
		outline: 2px solid transparent;
		outline-offset: -2px;
	}

	:host( [disabled] ) .input-base {
		background: var( --wp-components-color-gray-100, #f0f0f0 );
	}

	:host( [disabled] ) .input-base::after {
		border-color: var( --wp-components-color-gray-400, #ccc );
	}

	:host( [borderless] ) .input-base::after {
		border-color: transparent;
	}

	/* ---- Input element ---- */

	input {
		appearance: none;
		background: transparent;
		border: none;
		box-shadow: none !important;
		box-sizing: border-box;
		color: var( --wp-components-color-foreground, #1e1e1e );
		display: block;
		font-family: inherit;
		font-size: 13px;
		height: 40px;
		line-height: 1;
		margin: 0;
		min-height: 40px;
		outline: none;
		padding: 0 12px;
		width: 100%;
	}

	input::placeholder {
		color: color-mix(
			in srgb,
			var( --wp-components-color-foreground, #1e1e1e ),
			transparent 38%
		);
	}

	:host( [disabled] ) input {
		color: var( --wp-components-color-gray-600, #949494 );
	}

	/* email/url — always LTR */
	input[type='email'],
	input[type='url'] {
		direction: ltr;
	}

	/* Mobile font-size override — prevent iOS zoom-on-focus */
	@media ( max-width: 600px ) {
		input {
			font-size: 16px;
		}
	}

	/* ---- Size variants ---- */

	:host( [size='small'] ) input {
		height: 24px;
		min-height: 24px;
		padding-inline: 8px;
		font-size: 11px;
	}

	:host( [size='compact'] ) input {
		height: 32px;
		min-height: 32px;
		padding-inline: 8px;
	}

	/* __unstable-large is same dimensions as default */

	/* Cascade padding custom property for prefix/suffix wrappers */
	:host( [size='small'] ) .input-base,
	:host( [size='compact'] ) .input-base {
		--_input-control-padding-x: 8px;
	}

	/* ---- Input padding when prefix/suffix present ---- */

	:host( [has-prefix] ) input {
		padding-inline-start: 4px;
	}

	:host( [has-suffix] ) input {
		padding-inline-end: 4px;
	}

	/* ---- Prefix / Suffix containers ---- */

	.prefix-wrapper {
		box-sizing: border-box;
		display: block;
	}

	.suffix-wrapper {
		align-items: center;
		align-self: stretch;
		box-sizing: border-box;
		display: flex;
	}

	:host( :not( [has-prefix] ) ) .prefix-wrapper {
		display: none;
	}

	:host( :not( [has-suffix] ) ) .suffix-wrapper {
		display: none;
	}

	/* ---- Help text ---- */

	.help {
		margin: 8px 0 0;
		font-size: 12px;
		font-style: normal;
		color: var( --wp-components-color-gray-700, #757575 );
	}

	/* ---- Input width ---- */

	:host( [input-width] ) .input-base {
		width: var( --_input-width );
		flex: none;
	}

	:host( [label-position='side'][input-width] ) .input-base {
		width: auto;
		flex: 1;
	}

	:host( [label-position='edge'][input-width] ) .input-base {
		flex: 0 0 var( --_input-width );
		width: auto;
	}

	/* ---- Drag cursor ---- */

	:host( [is-dragging] ) input {
		cursor: var( --_drag-cursor, ns-resize );
		user-select: none;
	}

	/* Hide number spinners when drag-enabled */
	:host( [is-drag-enabled] ) input::-webkit-outer-spin-button,
	:host( [is-drag-enabled] ) input::-webkit-inner-spin-button {
		-webkit-appearance: none !important;
		margin: 0 !important;
	}
`;
let Ne = 0;
const v = class v extends x {
  constructor() {
    super(), this._ariaObserver = null, this._isDirty = !1, this._isDragging = !1, this._dragStart = [0, 0], this._onPointerMoveBound = this._onPointerMove.bind(this), this._onPointerUpBound = this._onPointerUp.bind(this), this.disabled = !1, this.size = "default", this.labelPosition = "top", this.hideLabelFromVision = !1, this.type = "text", this.isPressEnterToChange = !1, this.isDragEnabled = !1, this.dragDirection = "n", this.dragThreshold = 10, this.borderless = !1, this.required = !1, this._controlId = `input-control-${++Ne}`;
  }
  connectedCallback() {
    super.connectedCallback(), this._ariaObserver = new MutationObserver(() => {
      this._syncAriaAttrs();
    }), this._ariaObserver.observe(this, {
      attributes: !0,
      attributeFilter: v._FORWARDED_ARIA_ATTRS
    });
  }
  disconnectedCallback() {
    var e;
    super.disconnectedCallback(), (e = this._ariaObserver) == null || e.disconnect(), this._ariaObserver = null, this._cleanupDrag();
  }
  firstUpdated() {
    this._syncAriaAttrs();
  }
  updated(e) {
    var i;
    const t = (i = this.shadowRoot) == null ? void 0 : i.querySelector("input");
    if (t && (e.has("value") && !this._isDirty && (t.value = this.value ?? ""), this._syncAriaDescribedby(t), e.has("inputWidth") && (this.inputWidth ? this.style.setProperty(
      "--_input-width",
      this.inputWidth
    ) : this.style.removeProperty("--_input-width")), e.has("dragDirection"))) {
      const s = this.dragDirection === "n" || this.dragDirection === "s";
      this.style.setProperty(
        "--_drag-cursor",
        s ? "ns-resize" : "ew-resize"
      );
    }
  }
  /**
   * Forwards ARIA naming attributes from the host element to the
   * internal input so assistive tech can reach them across the
   * shadow boundary.
   */
  _syncAriaAttrs() {
    var t;
    const e = (t = this.shadowRoot) == null ? void 0 : t.querySelector("input");
    if (e)
      for (const i of v._FORWARDED_ARIA_ATTRS) {
        if (i === "aria-describedby") {
          this._syncAriaDescribedby(e);
          continue;
        }
        const s = this.getAttribute(i);
        s ? e.setAttribute(i, s) : e.removeAttribute(i);
      }
  }
  /**
   * Merges the host's `aria-describedby` with the generated help
   * text ID and applies the combined value to the internal input.
   *
   * @param {HTMLElement} input The internal input element.
   */
  _syncAriaDescribedby(e) {
    const t = [];
    this.help && t.push(`${this._controlId}__help`);
    const i = this.getAttribute("aria-describedby");
    i && t.push(...i.split(/\s+/).filter(Boolean)), t.length ? e.setAttribute("aria-describedby", t.join(" ")) : e.removeAttribute("aria-describedby");
  }
  /**
   * Handles prefix slot change to toggle the `has-prefix` attribute.
   *
   * @param {Event} event The slotchange event.
   */
  _onPrefixSlotChange(e) {
    e.target.assignedNodes({ flatten: !0 }).length > 0 ? this.setAttribute("has-prefix", "") : this.removeAttribute("has-prefix");
  }
  /**
   * Handles suffix slot change to toggle the `has-suffix` attribute.
   *
   * @param {Event} event The slotchange event.
   */
  _onSuffixSlotChange(e) {
    e.target.assignedNodes({ flatten: !0 }).length > 0 ? this.setAttribute("has-suffix", "") : this.removeAttribute("has-suffix");
  }
  /**
   * Handles native input events. In normal mode dispatches both
   * `input` and `change` events. In `isPressEnterToChange` mode
   * only dispatches `input`.
   */
  _onInput(e) {
    e.stopPropagation();
    const i = e.target.value;
    if (this.isPressEnterToChange) {
      this._isDirty = !0, this.dispatchEvent(
        new CustomEvent("input", {
          bubbles: !0,
          composed: !0,
          detail: { value: i }
        })
      );
      return;
    }
    this.value = i, this.dispatchEvent(
      new CustomEvent("input", {
        bubbles: !0,
        composed: !0,
        detail: { value: i }
      })
    ), this.dispatchEvent(
      new CustomEvent("change", {
        bubbles: !0,
        composed: !0,
        detail: { value: i }
      })
    );
  }
  /**
   * Handles keydown events on the input. In `isPressEnterToChange`
   * mode, Enter commits the draft value and Escape resets it.
   *
   * @param {KeyboardEvent} event The keydown event.
   */
  _onKeyDown(e) {
    if (!this.isPressEnterToChange)
      return;
    const t = e.target;
    e.key === "Enter" ? this._isDirty && this._commitValue(t) : e.key === "Escape" && this._isDirty && (t.value = this.value ?? "", this._isDirty = !1);
  }
  /**
   * Handles blur on the input. In `isPressEnterToChange` mode,
   * blur commits any unsaved draft.
   */
  _onBlur(e) {
    if (this.isPressEnterToChange && this._isDirty) {
      const t = e.target;
      this._commitValue(t);
    }
  }
  /**
   * Commits the current input value — updates `this.value`, clears
   * dirty flag, and dispatches a `change` event.
   *
   * @param {HTMLInputElement} input The native input element.
   */
  _commitValue(e) {
    this.value = e.value, this._isDirty = !1, this.dispatchEvent(
      new CustomEvent("change", {
        bubbles: !0,
        composed: !0,
        detail: { value: e.value }
      })
    );
  }
  /* ---- Drag gesture ---- */
  /**
   * Handles pointerdown on the input to initiate a drag gesture
   * when `isDragEnabled` is true.
   *
   * @param {PointerEvent} event The pointerdown event.
   */
  _onPointerDown(e) {
    this.isDragEnabled && (this._dragStart = [e.clientX, e.clientY], this._isDragging = !1, window.addEventListener(
      "pointermove",
      this._onPointerMoveBound
    ), window.addEventListener("pointerup", this._onPointerUpBound));
  }
  /**
   * Handles pointermove during a drag gesture. Starts dragging
   * once the distance exceeds `dragThreshold`.
   *
   * @param {PointerEvent} event The pointermove event.
   */
  _onPointerMove(e) {
    const t = e.clientX - this._dragStart[0], i = e.clientY - this._dragStart[1];
    if (!this._isDragging) {
      if (Math.sqrt(t * t + i * i) < this.dragThreshold)
        return;
      this._isDragging = !0, this.setAttribute("is-dragging", ""), document.documentElement.style.cursor = this.dragDirection === "n" || this.dragDirection === "s" ? "ns-resize" : "ew-resize", this.dispatchEvent(
        new CustomEvent("drag-start", {
          bubbles: !0,
          composed: !0,
          detail: { delta: [t, i] }
        })
      );
    }
    e.preventDefault(), this.dispatchEvent(
      new CustomEvent("drag", {
        bubbles: !0,
        composed: !0,
        detail: { delta: [t, i] }
      })
    );
  }
  /**
   * Handles pointerup to end a drag gesture.
   */
  _onPointerUp(e) {
    if (this._isDragging) {
      const t = e.clientX - this._dragStart[0], i = e.clientY - this._dragStart[1];
      this.dispatchEvent(
        new CustomEvent("drag-end", {
          bubbles: !0,
          composed: !0,
          detail: { delta: [t, i] }
        })
      );
    }
    this._cleanupDrag();
  }
  /**
   * Removes drag-related listeners and resets drag state.
   */
  _cleanupDrag() {
    this._isDragging = !1, this.removeAttribute("is-dragging"), document.documentElement.style.removeProperty("cursor"), window.removeEventListener(
      "pointermove",
      this._onPointerMoveBound
    ), window.removeEventListener(
      "pointerup",
      this._onPointerUpBound
    );
  }
  /* ---- Render helpers ---- */
  /**
   * Renders the label element.
   */
  _renderLabel() {
    return this.label ? this.hideLabelFromVision ? u`
				<label
					class="visually-hidden"
					for=${this._controlId}
				>${this.label}</label>
			` : u`
			<label
				class="label"
				for=${this._controlId}
				part="label"
			>${this.label}</label>
		` : l;
  }
  /**
   * Renders help text below the control.
   */
  _renderHelp() {
    return this.help ? u`
			<p
				class="help"
				id=${`${this._controlId}__help`}
				part="help"
			>${this.help}</p>
		` : l;
  }
  render() {
    return u`
			<div class="root" part="root">
				${this._renderLabel()}
				<div class="input-base" part="input-base">
					<span class="prefix-wrapper">
						<slot
							name="prefix"
							@slotchange=${this._onPrefixSlotChange}
						></slot>
					</span>
					<input
						id=${this._controlId}
						part="input"
						type=${this.type}
						?disabled=${this.disabled}
						?required=${this.required}
						placeholder=${this.placeholder ?? l}
						name=${this.name ?? l}
						min=${this.min ?? l}
						max=${this.max ?? l}
						step=${this.step ?? l}
						autocomplete=${this.autocomplete ?? l}
						.value=${this.value ?? ""}
						@input=${this._onInput}
						@keydown=${this._onKeyDown}
						@blur=${this._onBlur}
						@pointerdown=${this._onPointerDown}
					/>
					<span class="suffix-wrapper">
						<slot
							name="suffix"
							@slotchange=${this._onSuffixSlotChange}
						></slot>
					</span>
				</div>
				${this._renderHelp()}
			</div>
		`;
  }
};
v.styles = Be, v.properties = {
  label: { type: String, reflect: !0 },
  help: { type: String, reflect: !0 },
  disabled: { type: Boolean, reflect: !0 },
  size: { type: String, reflect: !0 },
  labelPosition: {
    type: String,
    reflect: !0,
    attribute: "label-position"
  },
  hideLabelFromVision: {
    type: Boolean,
    reflect: !0,
    attribute: "hide-label-from-vision"
  },
  value: { type: String },
  type: { type: String, reflect: !0 },
  placeholder: { type: String },
  isPressEnterToChange: {
    type: Boolean,
    reflect: !0,
    attribute: "is-press-enter-to-change"
  },
  isDragEnabled: {
    type: Boolean,
    reflect: !0,
    attribute: "is-drag-enabled"
  },
  dragDirection: {
    type: String,
    reflect: !0,
    attribute: "drag-direction"
  },
  dragThreshold: {
    type: Number,
    attribute: "drag-threshold"
  },
  borderless: { type: Boolean, reflect: !0 },
  inputWidth: {
    type: String,
    reflect: !0,
    attribute: "input-width"
  },
  name: { type: String },
  required: { type: Boolean, reflect: !0 },
  min: { type: String },
  max: { type: String },
  step: { type: String },
  autocomplete: { type: String }
}, v._FORWARDED_ARIA_ATTRS = [
  "aria-label",
  "aria-labelledby",
  "aria-describedby"
];
let K = v;
customElements.define(
  "wp-components-input-control",
  K
);
const Le = N`
	:host {
		--checkbox-input-size: 16px;
		--checkbox-input-margin: 8px;

		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
			Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
		font-size: 13px;
		box-sizing: border-box;
		display: block;
	}

	*,
	*::before,
	*::after {
		box-sizing: inherit;
	}

	.checkbox-row {
		display: flex;
		align-items: flex-start;
		justify-content: flex-start;
	}

	.input-container {
		position: relative;
		display: inline-block;
		margin-right: var( --checkbox-input-margin );
		vertical-align: middle;
		width: var( --checkbox-input-size );
		aspect-ratio: 1;
		line-height: 1;
		flex-shrink: 0;
	}

	input[type="checkbox"] {
		appearance: none;
		border: 1px solid #949494;
		border-radius: 2px;
		background: #fff;
		color: #1e1e1e;
		clear: none;
		cursor: pointer;
		display: inline-block;
		line-height: 0;
		margin: 0;
		outline: 0;
		padding: 0 !important;
		text-align: center;
		vertical-align: top;
		width: var( --checkbox-input-size );
		height: var( --checkbox-input-size );
	}

	@media not ( prefers-reduced-motion ) {
		input[type="checkbox"] {
			transition: 0.1s border-color ease-in-out;
		}
	}

	input[type="checkbox"]:focus {
		box-shadow:
			0 0 0 var( --wp-admin-border-width-focus, 2px ) #fff,
			0 0 0 calc( 2 * var( --wp-admin-border-width-focus, 2px ) ) var( --wp-admin-theme-color, #3858e9 );
		outline: 2px solid transparent;
		outline-offset: 2px;
	}

	input[type="checkbox"]:checked,
	input[type="checkbox"]:indeterminate {
		background: var( --wp-components-color-accent, var( --wp-admin-theme-color, #3858e9 ) );
		border-color: var( --wp-components-color-accent, var( --wp-admin-theme-color, #3858e9 ) );
	}

	input[type="checkbox"]:checked::before {
		content: none;
	}

	.checked-icon,
	.indeterminate-icon {
		fill: #fff;
		cursor: pointer;
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate( -50%, -50% );
		width: calc( var( --checkbox-input-size ) + 4px );
		height: calc( var( --checkbox-input-size ) + 4px );
		user-select: none;
		pointer-events: none;
	}

	.checkbox-label {
		line-height: var( --checkbox-input-size );
		cursor: pointer;
	}

	.help {
		margin-top: 8px;
		margin-bottom: 0;
		font-size: 12px;
		font-style: normal;
		color: var( --wp-components-color-gray-700, #757575 );
		display: inline-block;
		margin-inline-start: calc( var( --checkbox-input-size ) + var( --checkbox-input-margin ) );
	}
`;
let Fe = 0;
const $ = class $ extends x {
  constructor() {
    super(), this._ariaObserver = null, this.checked = !1, this.indeterminate = !1, this.disabled = !1, this._controlId = `checkbox-control-${++Fe}`;
  }
  connectedCallback() {
    super.connectedCallback(), this._ariaObserver = new MutationObserver(() => {
      this._syncAriaAttrs();
    }), this._ariaObserver.observe(this, {
      attributes: !0,
      attributeFilter: $._FORWARDED_ARIA_ATTRS
    });
  }
  disconnectedCallback() {
    var e;
    super.disconnectedCallback(), (e = this._ariaObserver) == null || e.disconnect(), this._ariaObserver = null;
  }
  firstUpdated() {
    this._syncAriaAttrs();
  }
  updated() {
    var t;
    const e = (t = this.shadowRoot) == null ? void 0 : t.querySelector("input");
    e && (e.indeterminate = !!this.indeterminate, this._syncAriaDescribedby(e));
  }
  /**
   * Forwards ARIA naming attributes from the host element to the
   * internal input so assistive tech can reach them across the
   * shadow boundary.
   *
   * `aria-describedby` is special: the generated help text ID is
   * merged with any value set on the host, so both the built-in
   * help text and external descriptions are announced.
   */
  _syncAriaAttrs() {
    var t;
    const e = (t = this.shadowRoot) == null ? void 0 : t.querySelector("input");
    if (e)
      for (const i of $._FORWARDED_ARIA_ATTRS) {
        if (i === "aria-describedby") {
          this._syncAriaDescribedby(e);
          continue;
        }
        const s = this.getAttribute(i);
        s ? e.setAttribute(i, s) : e.removeAttribute(i);
      }
  }
  /**
   * Merges the host's `aria-describedby` with the generated help
   * text ID and applies the combined value to the internal input.
   *
   * @param {HTMLInputElement} input The internal checkbox input.
   */
  _syncAriaDescribedby(e) {
    const t = [];
    this.help && t.push(`${this._controlId}__help`);
    const i = this.getAttribute("aria-describedby");
    i && t.push(...i.split(/\s+/).filter(Boolean)), t.length ? e.setAttribute("aria-describedby", t.join(" ")) : e.removeAttribute("aria-describedby");
  }
  /**
   * Handles the checkbox change event. Dispatches a `change`
   * CustomEvent with `detail.checked`.
   *
   * @param {Event} event The native change event.
   */
  _onChange(e) {
    const t = e.target;
    this.checked = t.checked, this.indeterminate = !1, this.dispatchEvent(
      new CustomEvent("change", {
        detail: { checked: t.checked },
        bubbles: !0,
        composed: !0
      })
    );
  }
  /**
   * Safari compatibility: focus the checkbox on click, since Safari
   * doesn't auto-focus checkboxes when clicked.
   *
   * @param {MouseEvent} event The native click event.
   */
  _onClick(e) {
    e.currentTarget.focus();
  }
  /**
   * Renders the check icon SVG overlay when checked (not indeterminate).
   */
  _renderCheckedIcon() {
    return !this.checked || this.indeterminate ? l : u`
			<svg viewBox="0 0 24 24" class="checked-icon" role="presentation">
				<path d="M16.5 7.5 10 13.9l-2.5-2.4-1 1 3.5 3.6 7.5-7.6z" />
			</svg>
		`;
  }
  /**
   * Renders the indeterminate icon SVG overlay.
   */
  _renderIndeterminateIcon() {
    return this.indeterminate ? u`
			<svg viewBox="0 0 24 24" class="indeterminate-icon" role="presentation">
				<path d="M7 11.5h10V13H7z" />
			</svg>
		` : l;
  }
  /**
   * Renders help text below the checkbox, indented to align below
   * the label text (not the checkbox input).
   */
  _renderHelp() {
    if (!this.help)
      return l;
    const e = `${this._controlId}__help`;
    return u`
			<p class="help" id=${e}>${this.help}</p>
		`;
  }
  render() {
    return u`
			<div class="checkbox-row">
				<span class="input-container">
					<input
						type="checkbox"
						id=${this._controlId}
						value="1"
						.checked=${this.checked}
						?disabled=${this.disabled}
						@change=${this._onChange}
						@click=${this._onClick}
					/>
					${this._renderIndeterminateIcon()}
					${this._renderCheckedIcon()}
				</span>
				${this.label ? u`<label class="checkbox-label" for=${this._controlId}>${this.label}</label>` : l}
			</div>
			${this._renderHelp()}
		`;
  }
};
$.styles = Le, $.properties = {
  label: { type: String, reflect: !0 },
  checked: { type: Boolean, reflect: !0 },
  indeterminate: { type: Boolean, reflect: !0 },
  help: { type: String, reflect: !0 },
  disabled: { type: Boolean, reflect: !0 }
}, $._FORWARDED_ARIA_ATTRS = [
  "aria-label",
  "aria-labelledby",
  "aria-describedby"
];
let Y = $;
customElements.define(
  "wp-components-checkbox-control",
  Y
);
const Ve = N`
	:host {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
			Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
		font-size: 13px;
		box-sizing: border-box;
		display: block;
	}

	*,
	*::before,
	*::after {
		box-sizing: inherit;
	}

	/* ---------- Layout ---------- */

	.toggle-row {
		display: flex;
		justify-content: flex-start;
		gap: 8px;
		align-items: center;
	}

	/* ---------- Form toggle container ---------- */

	.form-toggle {
		position: relative;
		display: inline-block;
		height: 16px;
		flex-shrink: 0;
	}

	/* ---------- Track ---------- */

	.toggle-track {
		position: relative;
		display: inline-block;
		box-sizing: border-box;
		vertical-align: top;
		background-color: #fff;
		border: 1px solid #949494;
		width: 32px;
		height: 16px;
		border-radius: 8px;
		overflow: hidden;
	}

	@media not ( prefers-reduced-motion ) {
		.toggle-track {
			transition:
				0.2s background-color ease,
				0.2s border-color ease;
		}
	}

	/* Windows High Contrast Mode */
	.toggle-track::after {
		content: "";
		position: absolute;
		inset: 0;
		box-sizing: border-box;
		border-top: 16px solid transparent;
		opacity: 0;
	}

	@media not ( prefers-reduced-motion ) {
		.toggle-track::after {
			transition: 0.2s opacity ease;
		}
	}

	/* ---------- Thumb ---------- */

	.toggle-thumb {
		display: block;
		position: absolute;
		box-sizing: border-box;
		top: 2px;
		left: 2px;
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background-color: #1e1e1e;
		box-shadow:
			0 1px 1px rgba( 0, 0, 0, 0.03 ),
			0 1px 2px rgba( 0, 0, 0, 0.02 ),
			0 3px 3px rgba( 0, 0, 0, 0.02 ),
			0 4px 4px rgba( 0, 0, 0, 0.01 );
		/* Transparent border acts as a fill in Windows High Contrast Mode. */
		border: 6px solid transparent;
	}

	@media not ( prefers-reduced-motion ) {
		.toggle-thumb {
			transition:
				0.2s transform ease,
				0.2s background-color ease-out;
		}
	}

	/* ---------- Hidden input ---------- */

	.toggle-input {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		opacity: 0;
		margin: 0;
		padding: 0;
		border: none;
		z-index: 1;
	}

	.toggle-input:checked {
		background: none;
	}

	.toggle-input::before {
		content: "";
	}

	.toggle-input:not( :disabled ) {
		cursor: pointer;
	}

	/* ---------- Checked state ---------- */

	.form-toggle.is-checked .toggle-track {
		background-color: var(
			--wp-components-color-accent,
			var( --wp-admin-theme-color, #3858e9 )
		);
		border-color: var(
			--wp-components-color-accent,
			var( --wp-admin-theme-color, #3858e9 )
		);
	}

	.form-toggle.is-checked .toggle-track::after {
		opacity: 1;
	}

	.form-toggle.is-checked .toggle-thumb {
		background-color: #fff;
		border-width: 0;
		transform: translateX( 16px );
	}

	/* ---------- Focus state ---------- */

	.toggle-input:focus + .toggle-track {
		box-shadow:
			0 0 0 var( --wp-admin-border-width-focus, 2px ) #fff,
			0 0 0 calc( 2 * var( --wp-admin-border-width-focus, 2px ) )
				var(
					--wp-components-color-accent,
					var( --wp-admin-theme-color, #3858e9 )
				);
		/* Windows High Contrast Mode */
		outline: 2px solid transparent;
		outline-offset: 2px;
	}

	/* ---------- Disabled state ---------- */

	:host( [disabled] ) .form-toggle {
		opacity: 0.3;
	}

	/* ---------- Label ---------- */

	.toggle-label {
		line-height: 16px;
		flex: 1;
		min-width: 0;
	}

	.toggle-label:not( .is-disabled ) {
		cursor: pointer;
	}

	:host( [disabled] ) .toggle-label {
		cursor: default;
	}

	/* ---------- Help text ---------- */

	.help {
		margin-top: 8px;
		margin-bottom: 0;
		margin-inline-start: 40px;
		font-size: 12px;
		font-style: normal;
		color: var( --wp-components-color-gray-700, #757575 );
	}
`;
let qe = 0;
const B = class B extends x {
  constructor() {
    super(), this.checked = !1, this.disabled = !1, this._id = `toggle-control-${++qe}`;
  }
  /**
   * Handles the change event from the hidden checkbox input.
   *
   * @param {Event} event The native change event.
   */
  _onChange(e) {
    const t = e.target;
    this.checked = t.checked, this.dispatchEvent(
      new CustomEvent("change", {
        detail: { checked: t.checked },
        bubbles: !0,
        composed: !0
      })
    );
  }
  /**
   * Handles click on the hidden checkbox input.
   * Safari doesn't auto-focus checkboxes on click.
   *
   * @param {Event} event The native click event.
   */
  _onClick(e) {
    e.currentTarget.focus();
  }
  /**
   * Renders help text as a `<p>` in this component's shadow tree so the
   * `aria-describedby` IDREF on the checkbox can resolve to it. IDREF
   * relations do not cross shadow boundaries, so help text must live in
   * the same shadow root as the input — not inside BaseControl's shadow
   * root.
   */
  _renderHelp() {
    return this.help ? u`
			<p class="help" id=${`${this._id}__help`}>${this.help}</p>
		` : l;
  }
  render() {
    const e = this.help ? `${this._id}__help` : void 0;
    return u`
			<div class="toggle-control">
				<div class="toggle-row">
					<span class="form-toggle${this.checked ? " is-checked" : ""}">
						<input
							type="checkbox"
							class="toggle-input"
							id=${this._id}
							.checked=${this.checked}
							?disabled=${this.disabled}
							aria-describedby=${e ?? l}
							@change=${this._onChange}
							@click=${this._onClick}
						/>
						<span class="toggle-track"></span>
						<span class="toggle-thumb"></span>
					</span>
					${this.label ? u`<label
							class="toggle-label${this.disabled ? " is-disabled" : ""}"
							for=${this._id}
						>${this.label}</label>` : l}
				</div>
				${this._renderHelp()}
			</div>
		`;
  }
};
B.styles = Ve, B.properties = {
  label: { type: String, reflect: !0 },
  checked: { type: Boolean, reflect: !0 },
  disabled: { type: Boolean, reflect: !0 },
  help: { type: String, reflect: !0 }
};
let Z = B;
customElements.define(
  "wp-components-toggle-control",
  Z
);
