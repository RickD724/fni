"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { Product, Package } from "./types";

type Mode = "admin" | "customer";

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "multi_coverage",
    icon: "🎯",
    title: "Multi-Coverage Protection",
    subtitle: "Porsche Protection Plan",
    description:
      "Comprehensive protection combining Tire & Wheel, Dent, Windshield, and Key Protection. Complete coverage to preserve your Porsche's performance and appearance.",
    price: 2995,
    link: "https://assets-v2.porsche.com/us/-/media/Project/PCOM/North-America/USA/Porsche-Financial-Services/Protection-Plan-PDFs/Porsche-Multi-Coverage-Protection_240214",
  },
  {
    id: "tire_wheel",
    icon: "🛞",
    title: "Premier Tire & Wheel Protection",
    subtitle: "Porsche Protection Plan",
    description:
      "Protects against road hazards including glass, nails, potholes, and debris. Includes tire and wheel replacement, towing up to $250, and all labor costs.",
    price: 1850,
    link: "https://www.porsche.com/usa/accessoriesandservice/porschefinancialservices/protectionplan/tireandwheel/",
  },
  {
    id: "lease_end",
    icon: "🔑",
    title: "Lease-End Protection",
    subtitle: "Porsche Protection Plan",
    description:
      "Waive up to $7,500 of covered excess wear charges at lease end. Lease documents obtained on your behalf with benefits automatically reconciled.",
    price: 1994,
    link: "https://www.porsche.com/usa/accessoriesandservice/porschefinancialservices/protectionplan/leaseend/",
  },
  {
    id: "term_protection",
    icon: "🛡️",
    title: "Term Protection Plus",
    subtitle: "Porsche Protection Plan",
    description:
      "Covers parts and labor for wearable components up to 6 years or 72,000 miles with no deductible. Includes brake pads, battery, and wheel alignments.",
    price: 3878,
    link: "https://www.porsche.com/usa/accessoriesandservice/porschefinancialservices/protectionplan/term/",
  },
  {
    id: "surface_protection",
    icon: "✨",
    title: "SUNTEK Paint Protection Film",
    subtitle: "Ultimate Surface Protection",
    description:
      "Premium paint protection film shields your vehicle's finish from rock chips, scratches, and environmental damage. Self-healing technology keeps paint looking new.",
    price: 2495,
    link: "https://www.suntekfilms.com/",
  },
  {
    id: "dent_protection",
    icon: "🔧",
    title: "Dent Protection",
    subtitle: "Porsche Protection Plan",
    description:
      "Repairs door dings and minor dents from everyday use without harming your factory finish. Maintains vehicle appearance and resale value.",
    price: 630,
    link: "https://www.porsche.com/usa/accessoriesandservice/porschefinancialservices/protectionplan/",
  },
  {
    id: "vehicle_service",
    icon: "⚙️",
    title: "Vehicle Service Protection",
    subtitle: "Porsche Protection Plan",
    description:
      "Comprehensive mechanical coverage for engine, transmission, fuel systems, and more. Includes roadside assistance and rental car reimbursement.",
    price: 3805,
    link: "https://www.porsche.com/usa/accessoriesandservice/porschefinancialservices/protectionplan/vehicle-service/",
  },
  {
    id: "key_protection",
    icon: "🔐",
    title: "Key Protection",
    subtitle: "Porsche Protection Plan",
    description:
      "Covers loss, theft, or damage to your high-tech Porsche key. Replacement and reprogramming costs covered with nationwide service.",
    price: 395,
    link: "https://www.porsche.com/usa/accessoriesandservice/porschefinancialservices/protectionplan/",
  },
  {
    id: "windshield",
    icon: "🪟",
    title: "Windshield Protection",
    subtitle: "Porsche Protection Plan",
    description:
      "Repairs or replaces windshield damaged by rocks and road debris. Maintains clear visibility and driving safety without deductibles.",
    price: 495,
    link: "https://www.porsche.com/usa/accessoriesandservice/porschefinancialservices/protectionplan/",
  },
];

const DEFAULT_PACKAGES: Package[] = [
  {
    id: "bronze",
    name: "Bronze Package",
    description: "Essential protection for peace of mind",
    icon: "🥉",
    productIds: ["tire_wheel", "key_protection"],
    color: "#CD7F32",
  },
  {
    id: "silver",
    name: "Silver Package",
    description: "Comprehensive coverage for most drivers",
    icon: "🥈",
    productIds: ["tire_wheel", "dent_protection", "key_protection", "windshield"],
    discount: 5,
    color: "#C0C0C0",
  },
  {
    id: "gold",
    name: "Gold Package",
    description: "Premium protection with appearance coverage",
    icon: "🥇",
    productIds: ["multi_coverage", "surface_protection", "lease_end"],
    discount: 10,
    color: "#FFD700",
  },
  {
    id: "platinum",
    name: "Platinum Package",
    description: "Ultimate coverage - complete peace of mind",
    icon: "💎",
    productIds: ["multi_coverage", "term_protection", "surface_protection", "lease_end", "vehicle_service"],
    discount: 15,
    color: "#E5E4E2",
  },
];

// Compressed URL encoding - much shorter URLs!
function compressAndEncode(obj: unknown): string {
  const json = JSON.stringify(obj);
  // Use shorter field names to reduce size
  const compressed = json
    .replace(/"id":/g, '"i":')
    .replace(/"icon":/g, '"c":')
    .replace(/"title":/g, '"t":')
    .replace(/"subtitle":/g, '"s":')
    .replace(/"description":/g, '"d":')
    .replace(/"price":/g, '"p":')
    .replace(/"link":/g, '"l":');
  
  const b64 = btoa(encodeURIComponent(compressed));
  return b64.replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function decompressAndDecode<T>(str: string): T | null {
  try {
    let s = str.replaceAll("-", "+").replaceAll("_", "/");
    const pad = s.length % 4;
    if (pad) s += "=".repeat(4 - pad);
    const compressed = decodeURIComponent(atob(s));
    // Restore original field names
    const json = compressed
      .replace(/"i":/g, '"id":')
      .replace(/"c":/g, '"icon":')
      .replace(/"t":/g, '"title":')
      .replace(/"s":/g, '"subtitle":')
      .replace(/"d":/g, '"description":')
      .replace(/"p":/g, '"price":')
      .replace(/"l":/g, '"link":');
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
  const [packages, setPackages] = useState<Package[]>(DEFAULT_PACKAGES);
  const [viewMode, setViewMode] = useState<'products' | 'packages'>('products');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);
  const [showMobileSummary, setShowMobileSummary] = useState(false);

  const toastTimer = useRef<number | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  }

  function calculatePackagePrice(pkg: Package): number {
    const total = pkg.productIds.reduce((sum, id) => {
      const product = products.find(p => p.id === id);
      return sum + (product?.price || 0);
    }, 0);
    if (pkg.discount) {
      return Math.round(total * (1 - pkg.discount / 100));
    }
    return total;
  }

  function selectPackage(pkg: Package) {
    setSelected(new Set(pkg.productIds));
    showToast(`${pkg.name} selected!`);
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
      const decoded = decompressAndDecode<Product[]>(urlProducts);
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

    // Load packages from localStorage
    const savedPackages = window.localStorage.getItem("fi_packages_v1");
    if (savedPackages) {
      try {
        const parsed = JSON.parse(savedPackages) as Package[];
        if (Array.isArray(parsed) && parsed.length) setPackages(parsed);
      } catch {}
    }

    if (urlSelections) {
      const decodedSel = decompressAndDecode<string[]>(urlSelections);
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

  // Save packages to localStorage when they change
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isAdmin) return;
    window.localStorage.setItem("fi_packages_v1", JSON.stringify(packages));
  }, [packages, isAdmin]);

  const customerBaseUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.origin + "/customer";
  }, []);

  const productsToken = useMemo(() => compressAndEncode(products), [products]);
  const selectionsToken = useMemo(() => compressAndEncode(Array.from(selected)), [selected]);

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
    u.searchParams.set("selections", compressAndEncode([]));
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
            <div className="badge">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '28px', height: '28px' }}>
                <path d="M12 2L4 6V11C4 16.55 7.84 21.74 13 23C18.16 21.74 22 16.55 22 11V6L12 2Z" fill="white" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
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
              
              {/* Customer View Mode Toggle */}
              <div className="customerViewToggle">
                <button 
                  className={`customerViewBtn ${viewMode === 'packages' ? 'active' : ''}`}
                  onClick={() => setViewMode('packages')}
                >
                  🎁 Package Plans
                </button>
                <button 
                  className={`customerViewBtn ${viewMode === 'products' ? 'active' : ''}`}
                  onClick={() => setViewMode('products')}
                >
                  📦 Individual Products
                </button>
              </div>
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
                {viewMode === 'packages' ? (
                  <div className="packagesGrid">
                    {packages.map((pkg) => {
                      const packagePrice = calculatePackagePrice(pkg);
                      const savings = pkg.discount ? 
                        pkg.productIds.reduce((sum, id) => sum + (products.find(p => p.id === id)?.price || 0), 0) - packagePrice : 0;
                      const isPackageSelected = pkg.productIds.every(id => selected.has(id)) && selected.size === pkg.productIds.length;
                      
                      return (
                        <div key={pkg.id} className={`packageCard ${isPackageSelected ? 'selected' : ''}`}>
                          <div className="packageHeader" style={{ background: `linear-gradient(135deg, ${pkg.color}20 0%, ${pkg.color}40 100%)` }}>
                            <div className="packageIcon">{pkg.icon}</div>
                            <div className="packageName">{pkg.name}</div>
                            {pkg.discount && <div className="packageDiscount">Save {pkg.discount}%</div>}
                          </div>
                          <div className="packageBody">
                            <div className="packageDesc">{pkg.description}</div>
                            <div className="packageIncludes">
                              <div className="packageIncludesTitle">Includes:</div>
                              {pkg.productIds.map(id => {
                                const product = products.find(p => p.id === id);
                                return product ? (
                                  <div key={id} className="packageIncludeItem">
                                    <span>{product.icon} {product.title}</span>
                                    <span className="packageIncludePrice">{money(product.price)}</span>
                                  </div>
                                ) : null;
                              })}
                            </div>
                            <div className="packagePricing">
                              {savings > 0 && (
                                <div className="packageOriginalPrice">{money(packagePrice + savings)}</div>
                              )}
                              <div className="packageFinalPrice">{money(packagePrice)}</div>
                              {savings > 0 && (
                                <div className="packageSavings">You save {money(savings)}</div>
                              )}
                            </div>
                            <button 
                              className={`btn primary ${isPackageSelected ? 'selected' : ''}`}
                              onClick={() => selectPackage(pkg)}
                            >
                              {isPackageSelected ? '✓ Package Selected' : 'Select Package'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
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
                )}
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
                      <div className="btnRow" style={{ marginTop: "var(--spacing-lg)", gap: "var(--spacing-sm)" }}>
                        <button className="btn primary" style={{ flex: 1 }} onClick={() => copy(customerMenuUrl)}>📋 Copy</button>
                        <button className="btn success" style={{ flex: 1 }} onClick={emailSelections}>✉️ Email</button>
                      </div>
                      <div className="btnRow" style={{ marginTop: "var(--spacing-sm)" }}>
                        <button className="btn secondary" style={{ width: "100%" }} onClick={() => window.print()}>🖨️ Print</button>
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
                <div style={{ marginTop: '8px', padding: '4px 8px', background: '#f0f0f0', borderRadius: '4px', fontSize: '12px', fontFamily: 'monospace' }}>
                  Current Mode: {viewMode}
                </div>
              </div>
              <div className="adminActions">
                <div className="viewModeToggle">
                  <button 
                    className={`viewModeBtn ${viewMode === 'products' ? 'active' : ''}`}
                    onClick={() => {
                      console.log('Switching to products');
                      setViewMode('products');
                    }}
                  >
                    📦 Individual Products
                  </button>
                  <button 
                    className={`viewModeBtn ${viewMode === 'packages' ? 'active' : ''}`}
                    onClick={() => {
                      console.log('Switching to packages');
                      setViewMode('packages');
                    }}
                  >
                    🎁 Package Plans
                  </button>
                </div>
                <button className="btn danger" onClick={() => {
                  if (window.confirm('Reset all products to defaults? This cannot be undone.')) {
                    localStorage.removeItem("fi_products_v1");
                    setProducts(DEFAULT_PRODUCTS);
                    setPackages(DEFAULT_PACKAGES);
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

            {viewMode === 'products' ? (
              <>
                <div style={{ 
                  padding: '20px', 
                  background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)', 
                  color: 'white', 
                  borderRadius: '12px', 
                  marginTop: '20px',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  textAlign: 'center'
                }}>
                  ✅ PRODUCTS VIEW ACTIVE
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
          </>
        ) : (
          <>
            {/* PACKAGES ADMIN */}
            <div style={{ 
              padding: '20px', 
              background: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)', 
              color: 'white', 
              borderRadius: '12px', 
              marginTop: '20px',
              fontSize: '24px',
              fontWeight: 'bold',
              textAlign: 'center'
            }}>
              🎁 PACKAGES VIEW ACTIVE
            </div>
            <div className="packagesAdminGrid" style={{ marginTop: "var(--spacing-xl)" }}>
              {packages.map((pkg, idx) => {
                const packagePrice = calculatePackagePrice(pkg);
                const originalPrice = pkg.productIds.reduce((sum, id) => {
                  const product = products.find(p => p.id === id);
                  return sum + (product?.price || 0);
                }, 0);
                
                return (
                  <div key={pkg.id} className="packageAdminCard">
                    <div className="packageAdminHeader" style={{ background: `linear-gradient(135deg, ${pkg.color}20 0%, ${pkg.color}40 100%)` }}>
                      <input 
                        className="packageAdminName"
                        value={pkg.name}
                        onChange={(e) => {
                          const updated = [...packages];
                          updated[idx] = { ...pkg, name: e.target.value };
                          setPackages(updated);
                        }}
                        placeholder="Package Name"
                      />
                      <button 
                        className="btn danger" 
                        style={{ padding: "var(--spacing-sm) var(--spacing-md)" }}
                        onClick={() => {
                          if (window.confirm(`Delete ${pkg.name}?`)) {
                            setPackages(packages.filter((_, i) => i !== idx));
                            showToast(`${pkg.name} deleted`);
                          }
                        }}
                      >
                        Delete
                      </button>
                    </div>

                    <div className="packageAdminBody">
                      <div className="field">
                        <label>Icon (emoji)</label>
                        <input 
                          value={pkg.icon}
                          onChange={(e) => {
                            const updated = [...packages];
                            updated[idx] = { ...pkg, icon: e.target.value };
                            setPackages(updated);
                          }}
                          placeholder="🎁"
                        />
                      </div>

                      <div className="field">
                        <label>Description</label>
                        <textarea 
                          value={pkg.description}
                          onChange={(e) => {
                            const updated = [...packages];
                            updated[idx] = { ...pkg, description: e.target.value };
                            setPackages(updated);
                          }}
                          placeholder="Brief package description"
                          rows={2}
                        />
                      </div>

                      <div className="field">
                        <label>Badge Color (hex)</label>
                        <div style={{ display: "flex", gap: "var(--spacing-sm)", alignItems: "center" }}>
                          <input 
                            type="color"
                            value={pkg.color || "#2563EB"}
                            onChange={(e) => {
                              const updated = [...packages];
                              updated[idx] = { ...pkg, color: e.target.value };
                              setPackages(updated);
                            }}
                            style={{ width: "60px", height: "40px", cursor: "pointer" }}
                          />
                          <input 
                            value={pkg.color || "#2563EB"}
                            onChange={(e) => {
                              const updated = [...packages];
                              updated[idx] = { ...pkg, color: e.target.value };
                              setPackages(updated);
                            }}
                            placeholder="#2563EB"
                          />
                        </div>
                      </div>

                      <div className="field">
                        <label>Discount % (optional)</label>
                        <input 
                          type="number"
                          min="0"
                          max="100"
                          value={pkg.discount || 0}
                          onChange={(e) => {
                            const updated = [...packages];
                            updated[idx] = { ...pkg, discount: parseInt(e.target.value) || 0 };
                            setPackages(updated);
                          }}
                          placeholder="0"
                        />
                      </div>

                      <div className="field">
                        <label>Included Products</label>
                        <div className="packageProductsSelector">
                          {products.map(product => {
                            const isIncluded = pkg.productIds.includes(product.id);
                            return (
                              <div 
                                key={product.id}
                                className={`packageProductCheckbox ${isIncluded ? 'checked' : ''}`}
                                onClick={() => {
                                  const updated = [...packages];
                                  const newIds = isIncluded 
                                    ? pkg.productIds.filter(id => id !== product.id)
                                    : [...pkg.productIds, product.id];
                                  updated[idx] = { ...pkg, productIds: newIds };
                                  setPackages(updated);
                                }}
                              >
                                <input 
                                  type="checkbox" 
                                  checked={isIncluded}
                                  onChange={() => {}}
                                  style={{ marginRight: "8px" }}
                                />
                                <span>{product.icon} {product.title}</span>
                                <span style={{ marginLeft: "auto", fontWeight: 600, color: "var(--gray-600)" }}>
                                  {money(product.price)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="packageAdminPricing">
                        <div style={{ fontSize: "13px", color: "var(--gray-600)", marginBottom: "var(--spacing-xs)" }}>
                          Original: {money(originalPrice)}
                          {(pkg.discount ?? 0) > 0 && ` - ${pkg.discount}% = ${money(packagePrice)}`}
                        </div>
                        <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--primary)" }}>
                          Final Price: {money(packagePrice)}
                        </div>
                        {(pkg.discount ?? 0) > 0 && (
                          <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--success)" }}>
                            Saves ${originalPrice - packagePrice}!
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: "var(--spacing-xl)" }}>
              <button 
                className="btn primary" 
                onClick={() => {
                  const newPackage: Package = {
                    id: `package_${Date.now()}`,
                    name: "New Package",
                    description: "Package description",
                    icon: "🎁",
                    productIds: [],
                    discount: 0,
                    color: "#2563EB",
                  };
                  setPackages([...packages, newPackage]);
                  showToast("New package added");
                }}
              >
                Add Package
              </button>
            </div>
          </>
        )}

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
              <div className="floatingMobileSummaryIcon">🛒</div>
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
