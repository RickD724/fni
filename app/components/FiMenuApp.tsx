"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "./types";

type Mode = "admin" | "customer";

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "multi_coverage",
    icon: "📋",
    title: "Porsche Multi-Coverage",
    subtitle: "Porsche Financial Services",
    description:
      "Platinum Coverage: Tire & Wheel, Ding & Dent, Windshield, Key Replacement. Comprehensive protection for your vehicle.",
    price: 5344,
    link: "https://www.porsche.com/",
  },
  {
    id: "lease_end",
    icon: "🔒",
    title: "Lease-End Protection",
    subtitle: "Porsche Protection Plan",
    description:
      "Help minimize unexpected lease-end charges with coverage designed for common excess wear items.",
    price: 1994,
    link: "https://www.porsche.com/",
  },
  {
    id: "term_coverage",
    icon: "🛡️",
    title: "Term Coverage Plus",
    subtitle: "Porsche Financial Services",
    description:
      "Optional coverage for extra peace of mind and predictable ownership costs.",
    price: 3878,
    link: "https://www.porsche.com/",
  },
  {
    id: "xpel",
    icon: "⚡",
    title: "XPEL Surface Protection",
    subtitle: "Ultimate Paint Protection",
    description:
      "Protects your vehicle's finish and resale value with premium film and surface protection options.",
    price: 2495,
    link: "https://www.xpel.com/",
  },
  {
    id: "surface",
    icon: "✨",
    title: "Surface Protection",
    subtitle: "Cilajet Ultimate",
    description:
      "Protects paint surfaces from sun, weather, oxidation, and loss of gloss.",
    price: 1995,
    link: "https://www.cilajet.com/",
  },
  {
    id: "vehicle_service",
    icon: "🔧",
    title: "Vehicle Service Protection",
    subtitle: "Porsche Financial Services",
    description:
      "Nationwide service at authorized dealers plus roadside assistance and trip interruption coverage.",
    price: 3805,
    link: "https://www.porsche.com/",
  },
  {
    id: "dent",
    icon: "☂️",
    title: "Dent Protection",
    subtitle: "Porsche Financial Services",
    description:
      "Repairs dents and dings from everyday use without harming the factory finish.",
    price: 630,
    link: "https://www.porsche.com/",
  },
  {
    id: "tire_wheel",
    icon: "⚙️",
    title: "Tire & Wheel Protection",
    subtitle: "Porsche Financial Services",
    description:
      "Repair or replacement protection for tires and wheels damaged by common road hazards.",
    price: 1850,
    link: "https://www.porsche.com/",
  },
];

// URL-safe base64 helpers (handles unicode)
function b64uEncode(obj: unknown): string {
  const json = JSON.stringify(obj);
  const utf8 = encodeURIComponent(json);
  const b64 = btoa(utf8);
  return b64.replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function b64uDecode<T>(str: string): T | null {
  try {
    let s = str.replaceAll("-", "+").replaceAll("_", "/");
    const pad = s.length % 4;
    if (pad) s += "=".repeat(4 - pad);
    const utf8 = atob(s);
    const json = decodeURIComponent(utf8);
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

function safeUrl(url?: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  try {
    const u = new URL(trimmed);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.toString();
  } catch {
    return null;
  }
}

function money(n: number): string {
  const val = Number.isFinite(n) ? n : 0;
  return "$" + val.toLocaleString();
}

export default function FiMenuApp({ mode }: { mode: Mode }) {
  const isAdmin = mode === "admin";

  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);
  const [showMobileSummary, setShowMobileSummary] = useState(false);

  const toastTimer = useRef<number | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  }

  const total = useMemo(() => {
    let t = 0;
    selected.forEach((id) => {
      const p = products.find((x) => x.id === id);
      if (p) t += Number(p.price) || 0;
    });
    return t;
  }, [selected, products]);

  // Load from URL (products first, then selections), otherwise localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const urlProducts = params.get("products");
    const urlSelections = params.get("selections");

    let nextProducts: Product[] | null = null;

    if (urlProducts) {
      const decoded = b64uDecode<Product[]>(urlProducts);
      if (decoded && Array.isArray(decoded) && decoded.length) {
        nextProducts = decoded.map((p) => ({
          id: String(p.id ?? "product_" + crypto.randomUUID()),
          icon: String(p.icon ?? "🧩"),
          title: String(p.title ?? "Product"),
          subtitle: String(p.subtitle ?? ""),
          description: String(p.description ?? ""),
          price: Number(p.price ?? 0),
          link: typeof p.link === "string" ? p.link : "",
        }));
      }
    }

    if (!nextProducts) {
      const saved = window.localStorage.getItem("fi_products_v1");
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as Product[];
          if (Array.isArray(parsed) && parsed.length) nextProducts = parsed;
        } catch {}
      }
    }

    if (nextProducts) setProducts(nextProducts);

    if (urlSelections) {
      const decodedSel = b64uDecode<string[]>(urlSelections);
      if (decodedSel && Array.isArray(decodedSel)) {
        setSelected(new Set(decodedSel.map(String)));
      }
    }
  }, []);

  // Persist products (admin only)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isAdmin) return;
    window.localStorage.setItem("fi_products_v1", JSON.stringify(products));
  }, [products, isAdmin]);

  const customerBaseUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.origin + "/customer";
  }, []);

  const productsToken = useMemo(() => b64uEncode(products), [products]);
  const selectionsToken = useMemo(() => b64uEncode(Array.from(selected)), [selected]);

  const customerMenuUrl = useMemo(() => {
    if (!customerBaseUrl) return "";
    const u = new URL(customerBaseUrl);
    u.searchParams.set("products", productsToken);
    u.searchParams.set("selections", selectionsToken);
    return u.toString();
  }, [customerBaseUrl, productsToken, selectionsToken]);

  const adminShareUrl = useMemo(() => {
    if (!customerBaseUrl) return "";
    const u = new URL(customerBaseUrl);
    u.searchParams.set("products", productsToken);
    u.searchParams.set("selections", b64uEncode([]));
    return u.toString();
  }, [customerBaseUrl, productsToken]);

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      showToast("✅ Copied");
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      el.style.position = "fixed";
      el.style.left = "-9999px";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      showToast("✅ Copied");
    }
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function updateProduct(index: number, patch: Partial<Product>) {
    setProducts((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  }

  function addProduct() {
    const id = "product_" + Date.now();
    setProducts((prev) => [
      ...prev,
      { id, icon: "🆕", title: "New Product", subtitle: "Category", description: "Enter description...", price: 0, link: "" },
    ]);
    showToast("✅ Added");
  }

  function deleteProduct(index: number) {
    if (!confirm("Delete this product?")) return;
    setProducts((prev) => prev.filter((_, i) => i !== index));
    showToast("🗑️ Deleted");
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(products, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fi_products.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function importJson(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as Product[];
        if (!Array.isArray(parsed)) throw new Error("Invalid JSON");
        setProducts(
          parsed.map((p) => ({
            id: String(p.id ?? "product_" + crypto.randomUUID()),
            icon: String(p.icon ?? "🧩"),
            title: String(p.title ?? "Product"),
            subtitle: String(p.subtitle ?? ""),
            description: String(p.description ?? ""),
            price: Number(p.price ?? 0),
            link: typeof p.link === "string" ? p.link : "",
          }))
        );
        showToast("✅ Imported");
      } catch {
        showToast("❌ Import failed");
      }
    };
    reader.readAsText(file);
  }

  function emailSelections() {
    const subject = encodeURIComponent("My F&I Product Selections");
    const body = encodeURIComponent(
      `Here are my selections:\n\n${customerMenuUrl}\n\nPlease review and contact me to finalize.`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  return (
    <>
      <div className="header">
        <div className="header-inner">
          <div className="brand">
            <div className="badge">🛡️</div>
            <div>F&amp;I Product Menu</div>
          </div>
        </div>
      </div>

      <div className="container">
        {!isAdmin ? (
          <>
            <div className="hero">
              <h1>Premium Protection Plans for Your Vehicle</h1>
              <p>
                Choose from our comprehensive suite of protection products designed to safeguard your investment. Select the coverage that matches your needs, and share your personalized package with your advisor for seamless processing.
              </p>
            </div>

            <div className="share">
              <h3>📤 Share Your Selections</h3>
              <p>Send this link to your advisor to review your choices together.</p>
              <div className="shareRow">
                <div className="shareInputGroup">
                  <input className="shareInput" readOnly value={customerMenuUrl} onFocus={(e) => e.currentTarget.select()} />
                </div>
                <div className="shareActions">
                  <button className="btn shareBtn" onClick={() => copy(customerMenuUrl)}>📋 Copy Link</button>
                  <button className="btn shareBtn success" onClick={emailSelections}>✉️ Email</button>
                  <button className="btn shareBtn secondary" onClick={() => window.print()}>🖨️ Print</button>
                </div>
              </div>
            </div>

            <div className="layout">
              <div>
                <div className="grid">
                  {products.map((p) => {
                    const isSelected = selected.has(p.id);
                    const link = safeUrl(p.link);
                    return (
                      <div key={p.id} className={"product " + (isSelected ? "selected" : "")}>
                        <div className="prodHead">
                          <div className="icon">{p.icon}</div>
                          <div className="title">{p.title}</div>
                          <div className="sub">{p.subtitle}</div>
                        </div>
                        <div className="prodBody">
                          <div className="desc">{p.description}</div>
                          <div className="priceBox">
                            <div className="amt">{money(p.price)}</div>
                          </div>
                          <div className="btnRow">
                            <button className="btn primary" onClick={() => toggle(p.id)}>
                              {isSelected ? "✓ Added" : "Add to Selection"}
                            </button>
                            {link ? (
                              <a className="btn link" href={link} target="_blank" rel="noreferrer">
                                Learn More
                              </a>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="summary">
                <div className="summaryInner">
                  <div className="summaryTitle">Your Selections</div>

                  {selected.size === 0 ? (
                    <div style={{ color: "var(--gray-500)", fontSize: "14px", textAlign: "center", padding: "var(--spacing-xl) 0" }}>
                      Add products to see your total
                    </div>
                  ) : (
                    <>
                      {Array.from(selected).map((id) => {
                        const p = products.find((x) => x.id === id);
                        if (!p) return null;
                        return (
                          <div key={id} className="item">
                            <div style={{ fontWeight: 600 }}>
                              {p.icon} {p.title}
                            </div>
                            <div style={{ fontWeight: 700, color: "var(--primary)" }}>{money(p.price)}</div>
                          </div>
                        );
                      })}
                      <div className="total">
                        <span>Total Investment</span>
                        <span style={{ color: "var(--primary)" }}>{money(total)}</span>
                      </div>
                      <div className="btnRow" style={{ marginTop: "var(--spacing-lg)" }}>
                        <button className="btn primary" onClick={() => copy(customerMenuUrl)}>Copy Link</button>
                        <button className="btn secondary" onClick={() => window.print()}>Print</button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="footer">
              <div>
                © {new Date().getFullYear()} <strong>F&I Product Menu</strong> by Ricardo Dias
              </div>
              <div style={{ marginTop: "var(--spacing-sm)" }}>
                <a href="/customer">Customer View</a> • <a href="/admin">Admin Dashboard</a>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="adminTop">
              <div className="adminTopLeft">
                <h2>Product Management</h2>
                <div className="muted">Configure your protection products, pricing, and customer sharing</div>
              </div>
              <div className="adminActions">
                <button className="btn danger" onClick={() => {
                  if (window.confirm('Reset all products to defaults? This cannot be undone.')) {
                    localStorage.removeItem("fi_products_v1");
                    setProducts(DEFAULT_PRODUCTS);
                    showToast("Reset to defaults");
                  }
                }}>
                  Reset to Defaults
                </button>
              </div>
            </div>

            <div className="adminShareCard">
              <div className="adminShareContent">
                <div className="adminShareLeft">
                  <h3>📤 Customer Link</h3>
                  <p>Share this link with customers to view your product menu</p>
                </div>
                <div className="adminShareActions">
                  <input className="adminShareInput" readOnly value={adminShareUrl} onFocus={(e) => e.currentTarget.select()} />
                  <button className="btn primary" onClick={() => copy(adminShareUrl)}>📋 Copy Link</button>
                  <a className="btn success" href="/customer">👁️ Preview</a>
                </div>
              </div>
            </div>

            <div className="grid" style={{ marginTop: "var(--spacing-xl)" }}>
              {products.map((p, idx) => (
                <div key={p.id} className="adminCard">
                  <div className="adminCardHead">
                    <div className="name">{p.title}</div>
                    <button className="btn danger" style={{ padding: "var(--spacing-sm) var(--spacing-md)" }} onClick={() => deleteProduct(idx)}>Delete</button>
                  </div>

                  <div className="smallRow">
                    <div className="field">
                      <label>Icon</label>
                      <input value={p.icon} onChange={(e) => updateProduct(idx, { icon: e.target.value })} />
                    </div>
                    <div className="field">
                      <label>Title</label>
                      <input value={p.title} onChange={(e) => updateProduct(idx, { title: e.target.value })} />
                    </div>
                  </div>

                  <div className="field">
                    <label>Subtitle</label>
                    <input value={p.subtitle} onChange={(e) => updateProduct(idx, { subtitle: e.target.value })} />
                  </div>

                  <div className="field">
                    <label>Description</label>
                    <textarea value={p.description} onChange={(e) => updateProduct(idx, { description: e.target.value })} />
                  </div>

                  <div className="field">
                    <label>Product Link (Customer "Learn more")</label>
                    <input
                      value={p.link ?? ""}
                      placeholder="https://brand.com/product-page"
                      onChange={(e) => updateProduct(idx, { link: e.target.value })}
                    />
                  </div>

                  <div className="field">
                    <label>Price ($)</label>
                    <input
                      type="number"
                      value={Number(p.price) || 0}
                      onChange={(e) => updateProduct(idx, { price: Number(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "var(--spacing-xl)" }}>
              <button className="btn primary" onClick={addProduct}>Add Product</button>
            </div>

            <div className="footer">
              <div>
                © {new Date().getFullYear()} <strong>F&I Product Menu</strong> by Ricardo Dias
              </div>
              <div style={{ marginTop: "var(--spacing-sm)" }}>
                <a href="/customer">Customer View</a> • <a href="/admin">Admin Dashboard</a>
              </div>
            </div>
          </>
        )}
      </div>

      <div className={"toast " + (toast ? "show" : "")}>{toast ?? ""}</div>

      {/* Floating Mobile Summary Button */}
      {!isAdmin && selected.size > 0 && (
        <>
          <button 
            className="floatingMobileSummary"
            onClick={() => setShowMobileSummary(!showMobileSummary)}
            aria-label="View selections"
          >
            <div className="floatingMobileSummaryContent">
              <div className="floatingMobileSummaryBadge">{selected.size}</div>
              <div className="floatingMobileSummaryText">
                <div className="floatingMobileSummaryLabel">Your Selections</div>
                <div className="floatingMobileSummaryTotal">{money(total)}</div>
              </div>
              <div className="floatingMobileSummaryIcon">{showMobileSummary ? '✕' : '👁️'}</div>
            </div>
          </button>

          {/* Mobile Summary Overlay */}
          {showMobileSummary && (
            <div className="mobileSummaryOverlay" onClick={() => setShowMobileSummary(false)}>
              <div className="mobileSummaryPanel" onClick={(e) => e.stopPropagation()}>
                <div className="mobileSummaryHeader">
                  <h3>Your Selections</h3>
                  <button className="mobileSummaryClose" onClick={() => setShowMobileSummary(false)}>✕</button>
                </div>
                <div className="mobileSummaryBody">
                  {Array.from(selected).map((id) => {
                    const p = products.find((x) => x.id === id);
                    if (!p) return null;
                    return (
                      <div key={id} className="mobileSummaryItem">
                        <div>
                          <div className="mobileSummaryItemTitle">{p.icon} {p.title}</div>
                          <div className="mobileSummaryItemPrice">{money(p.price)}</div>
                        </div>
                        <button className="mobileSummaryItemRemove" onClick={() => toggle(p.id)}>Remove</button>
                      </div>
                    );
                  })}
                  <div className="mobileSummaryTotal">
                    <span>Total Investment</span>
                    <span>{money(total)}</span>
                  </div>
                </div>
                <div className="mobileSummaryFooter">
                  <button className="btn primary" onClick={() => { copy(customerMenuUrl); setShowMobileSummary(false); }}>📋 Copy Link</button>
                  <button className="btn success" onClick={() => { emailSelections(); setShowMobileSummary(false); }}>✉️ Email</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
