// Brand colors are CSS variables (space-separated RGB) so Admin → Branding can change them without a rebuild.
// Defaults live in app/globals.css (:root); the locale layout injects overrides from the `theme` setting.
const v = n => `rgb(var(--c-${n}) / <alpha-value>)`;
module.exports={content:["./app/**/*.{ts,tsx}","./components/**/*.{ts,tsx}"],theme:{extend:{colors:{navy:{950:v("navy950"),900:v("navy900"),800:v("navy800")},sky:{brand:v("sky")},blue:{brand:v("blue")},area:{red:v("red"),green:v("green"),lime:v("lime"),purple:v("purple"),teal:v("teal")}},fontFamily:{display:["var(--font-display)","var(--font-script, sans-serif)","sans-serif"],body:["var(--font-body)","var(--font-script, sans-serif)","sans-serif"]}}},plugins:[]};
