// Example theme config
export const themeConfig = {
  components: [
    { id: 'header1', props: { title: 'Welcome to My Shop' } },
    { id: 'hero', props: { headline: 'Big Sale' } },
    { id: 'footer1', props: { contactEmail: 'support@shop.com' } },
  ],
  styles: `
    /* custom css overrides */
    .header1 { background-color: #4f46e5; }
    .hero { font-size: 3rem; }
  `,
};
