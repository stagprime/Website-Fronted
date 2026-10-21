export const x2: Record<string, string> = {
"do-i-need-a-privacy-policy": `## What a good privacy policy contains

A useful privacy policy is specific to your business. It usually covers:

- **Who you are** and how to contact you about privacy.
- **What data you collect** — names, emails, phone numbers, payment details, device and usage data, cookies.
- **How you collect it** — forms, accounts, checkout, analytics, chat.
- **Why you use it** — to deliver orders, provide support, send marketing (with consent), improve the site.
- **Legal bases** where laws such as the GDPR apply — consent, contract, legitimate interests, legal obligation.
- **Who you share it with** — payment processors, email providers, hosting, analytics and advertising partners.
- **International transfers** if data leaves the user's region.
- **How long you keep it.**
- **User rights** — access, correction, deletion, objection and how to exercise them.
- **Cookies** and how to change consent.
- **Children's data**, if relevant.
- **When the policy was last updated.**

## Cookies and consent

If you use analytics or advertising cookies and have visitors from regions such as the EU or UK, you generally need consent before setting non-essential cookies. A consent banner should let users accept, reject or customise categories, and the choice should actually control which scripts load. Google's Consent Mode lets analytics and ads tags respect that choice.

## Common mistakes

- Copying another company's policy that describes data practices you do not have.
- Forgetting third-party tools such as chat widgets, pixels and embedded videos.
- Never updating the policy when you add new tools.
- Hiding the policy where users cannot find it — link it in the footer and next to forms.

## Related documents

Most websites also need **terms of service** that set rules for using the site and buying products, a **refund or returns policy** for e-commerce, and sometimes a **cookie policy**. Apps need a privacy policy link in their store listings, and stores review whether it matches the app's behaviour.

A template is a good starting point, but have a qualified professional review policies for your situation, especially if you handle sensitive data.`,

"how-to-build-a-saas-mvp": `## Choosing what to leave out

An MVP is defined as much by what it excludes. Typical items to postpone:

- Advanced roles and permissions beyond owner and member.
- Custom reporting — export to CSV first.
- Native mobile apps — a responsive web app is often enough.
- Integrations other than the one or two your first customers need.
- Self-serve enterprise features such as single sign-on.

Write the excluded list down and share it with the team so scope does not creep back in.

## Pricing your MVP

Charge early if you can. Paying users give clearer feedback than free ones and validate that the problem is worth solving. Start with simple plans — one or two tiers — and adjust once you understand usage. Stripe Billing or a similar service handles subscriptions, trials and invoices without custom code.

## Feedback loops

- Talk to users weekly in the first months.
- Instrument key actions: sign-up, activation (first meaningful use), retention after one and four weeks.
- Keep a single list of feature requests with how many users asked and why.
- Ship small improvements often and tell users when their request is live.

## Technical foundations worth getting right early

Even an MVP should have secure authentication, separated customer data, automated backups, error tracking and a simple deployment pipeline. These are cheap to set up at the start and expensive to retrofit. Everything else can be refined later.

## When to move beyond MVP

Signs you are ready to invest more: users keep coming back without reminders, they ask for the same next features, and some are willing to pay more for them. At that point, plan a roadmap around retention and expansion rather than adding everything at once.`,

"why-python-for-ai-apps": `## The Python AI ecosystem in practice

Python's strength is the breadth of mature libraries:

- **Data handling** — pandas and NumPy for cleaning and transforming data.
- **Classical machine learning** — scikit-learn for classification, regression and clustering.
- **Deep learning** — PyTorch and TensorFlow for neural networks.
- **Language models** — libraries for running, fine-tuning and serving models, plus SDKs for hosted model APIs.
- **Computer vision** — OpenCV and related tools.
- **APIs and services** — FastAPI and Flask to serve models to web and mobile apps.
- **Notebooks** — Jupyter for experimentation and sharing results.

Because researchers publish code in Python, new techniques usually appear there first.

## Typical architecture of an AI-powered app

1. **Front-end** — a web or mobile app (often TypeScript/React or native mobile code).
2. **Application back-end** — handles users, billing and business logic.
3. **AI service in Python** — exposes model inference through an API.
4. **Data storage** — a relational database plus, for retrieval-augmented generation, a vector index.
5. **Monitoring** — latency, cost per request, error rates and output quality.

Separating the Python AI service from the main back-end lets each scale independently and lets you swap models without touching the rest of the app.

## Python's limitations and how to work around them

Python can be slower than compiled languages for CPU-heavy work, but most AI libraries run their heavy computation in optimised native code or on GPUs. For high-throughput services, use asynchronous frameworks, batching, caching and horizontal scaling. For mobile on-device inference, models are often exported to formats that run natively.

## Cost control for AI features

AI features can have significant per-request costs. Cache frequent answers, choose the smallest model that meets quality needs, limit output length, and monitor usage per customer so pricing covers cost. Build fallbacks for when a model API is slow or unavailable.

## Getting started

Start with a narrow use case, a hosted model API and a small evaluation set of real examples. Measure quality before optimising cost or building custom models.`,

"seo-trends-voice-search": `## How voice queries differ

Voice searches tend to be longer, more conversational and more often phrased as questions: "where can I get my phone screen fixed near me" rather than "phone repair". Many are local and have immediate intent. Assistants often read a single answer, so being the best concise answer matters more than ranking somewhere on page one.

## Structuring content for spoken answers

- **Use question headings** that match how people speak.
- **Answer directly in the first sentence or two** under each heading — around 40–60 words is a good target for a spoken answer — then expand.
- **Use lists and steps** for processes, which assistants can read in order.
- **Write in plain language** — short sentences read aloud better.
- **Add FAQ sections** to service and product pages.

## Technical foundations

Voice results draw on the same index as regular search, so fundamentals still apply: fast mobile pages, HTTPS, clear structure and structured data. Schema types such as FAQPage, LocalBusiness and HowTo help search engines understand content. Speakable markup identifies sections suitable for audio on supported surfaces.

## Local voice search

For local businesses, voice search is largely driven by map listings. A complete Google Business Profile, consistent name, address and phone number across directories, accurate opening hours and strong reviews are essential. Also claim Apple Business Connect and Bing Places, which feed other assistants.

## AI assistants and answer engines

Conversational AI assistants increasingly answer questions directly and cite sources. The same principles help: clear, factual, well-structured content, a strong entity presence (consistent business information across the web), and pages that answer specific questions authoritatively. Allowing reputable AI crawlers and publishing a concise summary of your business, such as an llms.txt file, can help these systems describe you accurately.

## Measuring voice impact

Voice queries are not reported separately in most tools. Look for growth in long, question-style queries in Search Console and in calls and direction requests from your business profile.`,

"google-ads-management-cost": `## A first-90-days plan

A well-run account follows a predictable start:

1. **Weeks 1–2: foundations.** Conversion tracking for calls, forms and purchases; account structure; keyword research; negative keyword lists; ad copy and assets.
2. **Weeks 3–6: learning.** Campaigns run with conservative bids. Search term reports are reviewed several times a week to add negatives and new keywords.
3. **Weeks 7–12: optimisation.** Budget shifts to the best-performing campaigns, ad tests are evaluated, landing page improvements are made and bid strategies may move toward automated conversion-based bidding once there is enough data.

## Metrics that matter

- **Cost per conversion** and **conversion rate** — the core efficiency measures.
- **Return on ad spend** for e-commerce.
- **Search impression share** — how often you appear when eligible; low share due to budget means more spend could buy more conversions.
- **Quality Score components** — expected click-through rate, ad relevance and landing page experience.

Clicks and impressions alone say little about business results.`,

"how-to-hire-a-digital-marketing-agency": `## What to prepare before the first call

You will get better proposals if you bring:

- Access (or screenshots) of your analytics and Search Console.
- Your current monthly marketing spend by channel.
- A list of your main competitors.
- Your customer profile and average order or contract value.
- Any past marketing work and what happened.

Agencies can then propose based on data rather than assumptions.

## Evaluating a proposal

A strong proposal includes a short diagnosis of your current position, a prioritised plan, clear deliverables per month, the metrics that will be reported, the team involved, and pricing broken down by service. Be wary of proposals that look identical to the agency's sales deck with your name inserted.

## Onboarding checklist

Once you sign, a smooth onboarding typically covers: access to analytics, ad accounts, website and social profiles; a kickoff meeting to confirm goals and contacts; tracking set-up or audit; and a written 90-day plan with dates.`,

"digital-agency-pricing-guide": `## Retainer vs project: worked comparison

Consider a business that needs a new website and ongoing SEO. Option one is a fixed website project followed by a monthly SEO retainer. Option two is a single larger retainer covering both. The first gives a clear launch cost and a predictable monthly fee; the second spreads the cost but makes it harder to see what each part costs. Most businesses find separate line items easier to evaluate.

## What is usually not included

Ask about these explicitly: ad spend, stock images and fonts, premium plugins or apps, hosting and domain, copywriting, translation, photography and video production, and post-launch changes beyond the agreed revisions.

## Paying internationally

Agencies increasingly work across borders. Card payments via Stripe and similar processors handle currency conversion; confirm the invoice currency and whether taxes apply in your country.`,

"agency-vs-freelancer": `## Cost comparison example

Imagine a project that needs design, development, copywriting and SEO set-up. With freelancers, you hire four people, write four briefs, coordinate handovers and review each piece yourself. With an agency, you write one brief and review the combined result. Even if the freelancers' combined fees are lower, the value of your coordination time — and the risk of gaps between them — can make the agency the cheaper option overall.

## Managing freelancers well

If you choose freelancers, set them up for success: written briefs with examples, clear deadlines, one point of contact on your side, shared folders for assets, and milestone payments tied to deliverables. Use contracts that transfer intellectual property on payment.

## Managing an agency relationship

With an agency, agree a primary contact on both sides, a regular meeting rhythm, a shared task or project board, and a monthly report. Give feedback early and specifically. The best results come from treating the agency as a partner with access to the information they need.

## Hybrid teams

Many businesses combine an agency for strategy and core execution with specialist freelancers for specific tasks, or an in-house marketer who manages both. The right mix often changes as the business grows.`,
};
