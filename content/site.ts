// Single source of content (later moved to CMS). Facts from brand-data.md only.
export type Service = { slug: string; title: string; short: string; color: string; icon: string; intro: string; subs: { t: string; d: string }[]; outcomes: string[] };
export const services: Service[] = [
  { slug: "digital-marketing", title: "Digital Marketing", short: "SEO, ASO & paid media", color: "#48BDED", icon: "chart",
    intro: "Drive targeted traffic and maximize ROI with data-driven marketing. We specialize in advanced search engine visibility and high-converting ad campaigns.",
    subs: [{ t: "SEO & App Store Optimization (ASO)", d: "Technical SEO, content and on-page optimization, plus app store ranking." }, { t: "Google Ads, Bing Ads & Meta PPC", d: "Search, display and social campaigns built around measurable KPIs." }, { t: "Social Media & AdMob Monetization", d: "Social growth plus full AdSense/AdMob monetization setup." }],
    outcomes: ["More qualified traffic", "Lower cost per acquisition", "Monetized apps and content"] },
  { slug: "design-development", title: "Design & Development", short: "Web, apps & UI/UX", color: "#1071B2", icon: "code",
    intro: "Build powerful digital experiences. We engineer responsive websites and cross-platform mobile apps with user-centric UI/UX architecture.",
    subs: [{ t: "Native & Cross-Platform Apps (Flutter)", d: "Android, iOS and cross-platform apps with Flutter / React Native." }, { t: "Custom Web & E-commerce (Shopify)", d: "Custom MERN stack websites and Shopify stores." }, { t: "UI/UX Prototyping (Figma)", d: "Research-led wireframes, prototypes and design systems." }],
    outcomes: ["Fast, responsive products", "Conversion-focused UX", "Scalable codebases"] },
  { slug: "amazon-youtube-automation", title: "Amazon & YouTube Automation", short: "KDP, Merch & channels", color: "#D33F49", icon: "play",
    intro: "Scale your digital real estate. We offer complete Amazon publishing support and end-to-end YouTube channel management for maximum monetization.",
    subs: [{ t: "Amazon KDP Publishing & Merch", d: "Formatting, covers, listings and Merch on Demand support." }, { t: "YouTube SEO & Channel Automation", d: "Channel setup, SEO, content pipelines and faceless automation." }, { t: "Google AdSense Setup & Optimization", d: "Approval, placement and revenue optimization." }],
    outcomes: ["New passive revenue streams", "Algorithm-friendly content", "Hands-off channel operations"] },
  { slug: "ai-animation", title: "AI & Animation", short: "AI video, 2D/3D, VFX", color: "#9649CB", icon: "spark",
    intro: "Transform your content strategy with next-gen AI video production and custom animations that captivate your target audience.",
    subs: [{ t: "AI-Powered Video Generation", d: "AI-assisted ads, explainers and social video at scale." }, { t: "2D, 3D & Whiteboard Animation", d: "Custom animation for products, brands and education." }, { t: "Professional Video Editing & VFX", d: "Editing, color, motion graphics and effects." }],
    outcomes: ["Scroll-stopping content", "Faster production", "Consistent brand visuals"] },
  { slug: "writing-consulting", title: "Writing & Consulting", short: "Legal docs, copy & strategy", color: "#1A936F", icon: "pen",
    intro: "Protect and grow your business with expert legal documentation, high-converting SEO copywriting, and tailored digital strategy consulting.",
    subs: [{ t: "Legal Terms & Privacy Policies", d: "Website and app terms, privacy and compliance documentation." }, { t: "SEO Blog & Article Writing", d: "Search-optimized articles that rank and convert." }, { t: "Digital Marketing Strategy Consulting", d: "Roadmaps tailored to your KPI goals." }],
    outcomes: ["Compliance-ready documents", "Content that ranks", "A clear growth roadmap"] },
  { slug: "saas", title: "Software (SaaS)", short: "SaaS, cloud & DevOps", color: "#3FB7D3", icon: "cloud",
    intro: "Architect enterprise-grade software. We develop scalable SaaS platforms with robust cloud infrastructure and seamless API integrations.",
    subs: [{ t: "Custom SaaS & MVP Development", d: "From MVP to subscription-ready platforms." }, { t: "Cloud Backend & API Integration", d: "Secure backends, APIs and third-party integrations." }, { t: "DevOps & IoT Solutions", d: "CI/CD, infrastructure and connected devices." }],
    outcomes: ["Launch faster with an MVP", "Reliable cloud infrastructure", "Subscription-ready billing"] },
];
export const stores = [
  { n: "Redbubble", u: "https://Stag-Prime.redbubble.com" }, { n: "TeePublic", u: "https://www.teepublic.com/user/stagprime" },
  { n: "Zazzle", u: "https://www.zazzle.com/store/stagprime" }, { n: "Threadless", u: "https://stagprime.threadless.com/" },
  { n: "Spreadshirt", u: "https://www.spreadshirt.com/shop/user/stag+prime/" }, { n: "Creator-Spring", u: "https://stagprime.creator-spring.com" },
];
export type Venture = { slug: string; title: string; tag: string; color: string; icon: string; short: string; body: string; points: string[]; links?: { n: string; u: string }[] };
export const ventures: Venture[] = [
  { slug: "stag-vpn", title: "Stag VPN", tag: "Case Study · App", color: "#48BDED", icon: "shield", short: "In-house VPN app, sold to NexGlobo",
    body: "Built entirely in-house, Stag VPN showcases our capability in app development, server management and subscription marketing. Rated about 4.8★ on Google Play, the product was successfully sold to NexGlobo.",
    points: ["50+ global servers managed", "Custom protocol development", "Subscription marketing", "Acquired by NexGlobo"],
    links: [{ n: "Google Play listing", u: "https://play.google.com/store/apps/details?id=com.doracone.stagvpn" }, { n: "NexGlobo", u: "http://nexglobo.com/" }] },
  { slug: "print-on-demand", title: "Print-on-Demand Network", tag: "E-Commerce", color: "#D33F49", icon: "shirt", short: "10,000+ designs across 6 stores",
    body: "We operate merch stores across leading print-on-demand marketplaces. Our design team creates trend-driven designs that sell without holding inventory, supported by our own automated upload tools.",
    points: ["10,000+ designs live", "Automated upload tools", "Six marketplace storefronts"], links: stores },
  { slug: "media", title: "KDP, YouTube & Media", tag: "Media", color: "#9649CB", icon: "play", short: "Books, channels & content",
    body: "From low-content books on Amazon Kindle to faceless YouTube automation channels — we understand the algorithms because our own revenue depends on them.",
    points: ["Amazon KDP publishing", "Monetized YouTube channels", "Organic traffic strategy"], links: [{ n: "YouTube @stagprime", u: "https://youtube.com/@stagprime" }, { n: "Medium", u: "https://medium.com/@stagprime" }] },
  { slug: "software", title: "SaaS & Software", tag: "Software", color: "#3FB7D3", icon: "cloud", short: "Our own tools & products",
    body: "We build software for ourselves first — from VPN infrastructure to POD automation scripts and design systems — and sell the tools we rely on internally.",
    points: ["Stag Prime Sentinel — infrastructure monitoring", "POD Automation Script", "Agency UI Kit (Figma)", "Custom SaaS for clients"], links: [{ n: "Stag Prime Sentinel", u: "https://stag-prime-sentinel.vercel.app" }] },
];
export type Product = { slug: string; n: string; d: string; p: string; color: string; cat: string; kind: "digital" | "free" | "saas"; img?: string; url?: string; feats?: string[] };
export const products: Product[] = [
  { slug: "seo-checklist", n: "SEO Checklist", d: "Complete PDF guide to rank your agency website.", p: "Free", color: "#1A936F", cat: "marketing", kind: "free" },
  { slug: "agency-ui-kit", n: "Agency UI Kit (Figma)", d: "The exact design system used for Stag Prime.", p: "$49", color: "#9649CB", cat: "design-dev", kind: "digital" },
  { slug: "kdp-cover-templates", n: "KDP Cover Templates", d: "50+ editable high-res book covers for Amazon.", p: "$15", color: "#48BDED", cat: "amazon-youtube", kind: "digital" },
  { slug: "pod-automation-script", n: "POD Automation Script", d: "Python script to automate uploads on Redbubble.", p: "$29", color: "#D33F49", cat: "amazon-youtube", kind: "digital" },
  { slug: "stag-sentinel", n: "Stag Prime Sentinel", d: "Role-based infrastructure monitoring for approved teams and client workspaces — every server, every client, one secure view.", p: "Request access", color: "#3FB7D3", cat: "software", kind: "saas", img: "/img/real/sentinel-login.webp", url: "https://stag-prime-sentinel.vercel.app",
    feats: ["Multi-client infrastructure in one dashboard", "Protected server access", "Administrator, staff, view-only and client roles", "Separate client workspaces", "Secure cookie-based sessions — passwords never stored in the browser"] },
  { slug: "store-panel", n: "Stag Prime Store Panel", d: "Multi-tenant store admin for your own shop: your own products, your own delivery — no dropshipping.", p: "$20/month", color: "#1A936F", cat: "software", kind: "saas", url: "https://stag-prime-store-panel.vercel.app/subscribe",
    feats: ["Your own store admin — every shop is a separate tenant", "List and manage your own products and stock", "Run your own delivery and order fulfilment", "No dropshipping — you own the catalogue and the customer", "Simple monthly plan: $20/month"] },
];
export type StoreCat = { slug: string; t: string; d: string; color: string; svc?: string; icon: string };
export const storeCats: StoreCat[] = [
  { slug: "marketing", t: "Marketing Tools & Templates", d: "Checklists, templates and tools from our digital marketing team.", color: "#48BDED", svc: "digital-marketing", icon: "chart" },
  { slug: "design-dev", t: "Design & Development", d: "UI kits, themes and web app starters built by our design and development team.", color: "#1071B2", svc: "design-development", icon: "code" },
  { slug: "amazon-youtube", t: "Amazon KDP, Merch & YouTube", d: "KDP templates and print-on-demand automation from our publishing team.", color: "#D33F49", svc: "amazon-youtube-automation", icon: "play" },
  { slug: "ai-animation", t: "AI & Animation Assets", d: "Motion templates and AI video packs from our animation studio.", color: "#9649CB", svc: "ai-animation", icon: "spark" },
  { slug: "writing-consulting", t: "Writing & Consulting Templates", d: "Legal document templates, content briefs and strategy guides.", color: "#1A936F", svc: "writing-consulting", icon: "pen" },
  { slug: "software", t: "SaaS & Software", d: "Software we built for our own operations — now available to approved teams.", color: "#3FB7D3", svc: "saas", icon: "cloud" },
  { slug: "ready-made-businesses", t: "Ready-made Businesses", d: "Turnkey websites, apps and online stores we build, launch and hand over — ready to run.", color: "#F4B942", svc: "design-development", icon: "briefcase" },
  { slug: "merch", t: "Apparel & Merch", d: "Original Stag Prime designs on apparel, decor and accessories across six marketplaces.", color: "#20BF55", icon: "shirt" },
];

export const portfolio = [
  { slug: "stag-vpn", t: "Stag VPN", cat: "Development", d: "In-house VPN app built, scaled and sold to NexGlobo.", href: "/portfolio/stag-vpn", color: "#48BDED" },
  { slug: "fintech-dashboard", t: "FinTech Dashboard App", cat: "Development", d: "A secure React-based dashboard built for a US client.", color: "#1071B2" },
  { slug: "ecom-sales-boost", t: "E-com Sales Boost", cat: "Marketing", d: "300% ROI generated via Google Ads & SEO optimization.", color: "#20BF55" },
  { slug: "redbubble-best-sellers", t: "Redbubble Best Sellers", cat: "Creative & POD", d: "Typography designs for the Q4 holiday season.", color: "#D33F49" },
];
export const partners = { marketplaces: ["Redbubble", "Amazon KDP", "Teespring", "Zazzle"], tech: ["Shopify", "Google Ads", "Meta Business", "Payoneer"] };
export const socials = [
  ["Facebook", "https://www.facebook.com/stagprime"], ["Instagram", "https://www.instagram.com/stagprimes/"], ["X", "https://x.com/stag_prime"],
  ["LinkedIn", "https://www.linkedin.com/company/StagPrime"], ["YouTube", "https://youtube.com/@stagprime"], ["Pinterest", "https://www.pinterest.com/Stagprime/"],
  ["Medium", "https://medium.com/@stagprime"], ["Quora", "https://www.quora.com/profile/Stag-Prime"], ["Tumblr", "https://www.tumblr.com/stagprime"], ["Linktree", "https://linktr.ee/stagprime"],
];
export const profiles = [
  { n: "Trustpilot", u: "https://www.trustpilot.com/review/stagprime.com", d: "Read and leave verified customer reviews." },
  { n: "Clutch", u: "https://clutch.co/profile/stag-prime-digital-agency", d: "B2B agency profile and client feedback." },
  { n: "Crunchbase", u: "https://www.crunchbase.com/organization/stag-prime-digital-agency", d: "Company profile and details." },
  { n: "Yelp", u: "https://www.yelp.com/biz/stag-prime-digital-agency-sheridan", d: "Local business listing, Sheridan WY." },
  { n: "Google Play", u: "https://play.google.com/store/apps/details?id=com.doracone.stagvpn", d: "Stag VPN — about 4.8★ user rating." },
];
export const faqs = [
  ["What does Stag Prime do?", "Stag Prime is a full-service digital agency: digital marketing (SEO, ASO, paid ads), web and app development, Amazon & YouTube automation, AI video and animation, writing and legal documentation, and SaaS development. We also run our own products and print-on-demand stores."],
  ["Where is Stag Prime located?", "Stag Prime LLC is a Wyoming company (30 N Gould St #23907, Sheridan, WY 82801, USA) with an operations office in Rajshahi, Bangladesh, and serves clients worldwide."],
  ["How can I contact you fastest?", "Message us on WhatsApp (+1 307-396-4184), Telegram (@stagprime), call +1 307-396-4184, or email brand@stagprime.com."],
  ["How does a project start?", "We follow four steps: Analyze your current status, Strategize a roadmap around your KPIs, Execute with precision, and Scale based on data. It starts with a free strategy call."],
  ["How much do your services cost?", "Every project is scoped individually. Book a free strategy call and we'll send a tailored quote. Digital products in our store have fixed prices and are paid securely via Stripe."],
  ["Do you offer internships?", "Yes — we run an internship program in web development, app development, SEO and content, and a student/alumni network. See the Careers page."],
];
export const process = [["Analyze", "We audit your current status and identify growth gaps."], ["Strategize", "We build a roadmap tailored to your specific KPI goals."], ["Execute", "Our team deploys the solution with precision and speed."], ["Scale", "We optimize based on data to maximize your revenue."]];

// From the owner's home-page design spec (doc-1lKx...): starting prices & catalog
export const pricing = [
  { area: "Digital Marketing", slug: "digital-marketing", color: "#48BDED", rows: [["Basic SEO (on-page optimization)", "$250"], ["Full site audit + keyword strategy", "$500"], ["Social media account management", "$100 / mo"], ["Facebook Ads campaign", "$300"]] },
  { area: "App & Web Development", slug: "design-development", color: "#1071B2", rows: [["Basic app", "from $2,000"], ["App with advanced features", "$5,000+"], ["Simple landing page", "$1,000"], ["E-commerce website", "$3,000+"]] },
  { area: "Content, AI Video & Legal Writing", slug: "writing-consulting", color: "#1A936F", rows: [["Article writing — 500 words", "$50"], ["Article writing — 1,000 words", "$100"], ["AI video editing (basic)", "$150 / video"], ["Animated video", "$500"]] },
  { area: "Amazon KDP & Merch on Demand", slug: "amazon-youtube-automation", color: "#D33F49", rows: [["KDP full publishing (format, cover, upload)", "$200 / book"], ["Merch design", "$50 / design"], ["Merch design bundle", "$200"]] },
];
export const storeCategories = [
  { t: "Apparel", d: "Unisex & women's tees, hoodies & sweatshirts, long sleeves, kids & babies.", color: "#48BDED" },
  { t: "Home Decor & Accessories", d: "Pillows, wall art, mugs, tumblers, phone cases, stickers, bags, hats, socks, stationery.", color: "#9649CB" },
  { t: "Books (Amazon KDP)", d: "E-books, kids' coloring books and reading books.", color: "#D33F49" },
  { t: "Amazon Print-on-Demand", d: "Custom tees, hoodies, mugs and more via Amazon.", color: "#1A936F" },
];
export const extended: Record<string, string[]> = {
  "digital-marketing": ["On-page, off-page & technical SEO", "Keyword research & analysis", "SEO for apps (ASO)", "Google Ads, Bing Ads & retargeting", "Social media strategy & community management", "Google AdSense services", "Analytics & reporting", "Email & influencer marketing"],
  "design-development": ["UI/UX design, wireframes & prototypes", "iOS (Swift) & Android (Kotlin) apps", "React Native & Flutter apps", "Progressive web apps", "Custom backend, API & real-time sync", "Payment gateway & in-app purchases", "Testing & quality assurance", "Maintenance, updates & support", "Shopify, WooCommerce & custom e-commerce", "Landing pages & CMS websites"],
  "amazon-youtube-automation": ["KDP account setup & guidelines", "eBook & paperback formatting", "Cover & interior design", "Editing, proofreading & book descriptions", "Amazon Ads & launch promotion", "Merch on Demand designs & listings SEO", "YouTube channel setup & branding", "Scripts, voiceover, editing & thumbnails", "YouTube SEO & analytics"],
  "ai-animation": ["AI-generated video ads & explainers", "2D, 3D & whiteboard animation", "Motion graphics", "Editing, color grading & VFX", "Subtitles & captions", "Video content strategy"],
  "writing-consulting": ["Terms & Conditions writing", "Privacy Policy writing", "SEO articles & blog posts", "Digital marketing strategy consulting", "SEO, content & social media consulting", "Branding & positioning", "Analytics & CRO consulting", "E-commerce strategy", "Training & workshops", "Market research & feasibility"],
  "saas": ["Custom software & MVPs", "Cloud solutions (AWS, Google Cloud, Azure)", "Database design & migration", "DevOps: CI/CD, IaC, monitoring", "ERP, CRM & BI systems", "Chatbots (web, WhatsApp, Messenger)", "AI/ML: analytics, NLP, recommendations", "IoT applications & integrations"],
};
export const jobAreas = ["Digital Marketing Solutions", "SEO Services (Websites)", "SEO Services (Apps)", "App Design and Development", "Web Design and Development", "Graphic Design Services", "Software Services", "Amazon KDP Services", "Amazon Merch on Demand Services", "YouTube Services", "Google AdSense Services", "Google Ads Services", "Bing Ads Services", "Social Media Marketing (SMM)", "Article and Blog Post Writing", "AI Video Making and Editing", "Animation Services", "Terms and Conditions Writing", "Privacy Policy Writing", "Consulting Services"];
