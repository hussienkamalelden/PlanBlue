function generateSku(title: string): string {
  const slug = title
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 20);

  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `PB-${slug}-${random}`;
}

export default {
  beforeCreate(event: any) {
    const { data } = event.params;

    // Reset views to 0 on new product
    event.params.data.views = 0;
    if (data && typeof data.views !== 'undefined') {
      data.views = 0;
    }

    // Auto-generate SKU from title if not provided
    if (!data.sku && data.title) {
      event.params.data.sku = generateSku(data.title);
    }
  },

  beforeUpdate(event: any) {
    const { data } = event.params;

    // Generate SKU if it's empty and title exists
    if (data && !data.sku && data.title) {
      event.params.data.sku = generateSku(data.title);
    }
  },
};
