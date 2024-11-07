function root({shop, url}) {
  return {
    title: url.includes('search') ? 'Search results' : shop?.name,
    titleTemplate: `%s | ${shop?.name}`,
    description: truncate(shop?.description ?? ''),
    url,
    robots: {
      noIndex: false,
      noFollow: false,
    },
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: shop.name,
      logo: shop.brand?.logo?.image?.url,
      url,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${url}search?q={search_term}`,
        query: "required name='search_term'",
      },
    },
  };
}

function home({shop, url}) {
  return {
    title: 'Home',
    titleTemplate: `%s | ${shop?.name}`,
    description: truncate(shop?.description ?? ''),
    url,
    robots: {
      noIndex: false,
      noFollow: false,
    },
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Home page',
    },
  };
}

function productJsonLd({product, selectedVariant, url}) {
  const origin = new URL(url).origin;
  const variants = product.variants.nodes;
  const description = truncate(
    product?.seo?.description ?? product?.description,
  );
  const offers = (variants || []).map((variant) => {
    const variantUrl = new URL(url);
    for (const option of variant.selectedOptions) {
      variantUrl.searchParams.set(option.name, option.value);
    }
    const availability = variant.availableForSale
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock';

    return {
      '@type': 'Offer',
      availability,
      price: parseFloat(variant.price.amount),
      priceCurrency: variant.price.currencyCode,
      sku: variant?.sku ?? '',
      url: variantUrl.toString(),
    };
  });
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Products',
          item: `${origin}/products`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: product.title,
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      brand: {
        '@type': 'Brand',
        name: product.vendor,
      },
      description,
      image: [selectedVariant?.image?.url ?? ''],
      name: product.title,
      offers,
      sku: selectedVariant?.sku ?? '',
      url,
    },
  ];
}

function product({shop, product, url, selectedVariant}) {
  const description = truncate(
    product?.seo?.description ?? product?.description ?? '',
  );
  return {
    title: product?.seo?.title ?? product?.title,
    description,
    media: selectedVariant?.image,
    jsonLd: productJsonLd({product, selectedVariant, url}),
  };
}

async function collectionJsonLd({url, collectionProducts, collection}) {
  const siteUrl = new URL(url);
  const itemListElement = await collectionProducts.products.nodes.map(
    (product, index) => {
      return {
        '@type': 'ListItem',
        position: index + 1,
        url: `/products/${product.handle}`,
      };
    },
  );

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Collections',
          item: `${siteUrl.host}/collections`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: collection.title,
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: collection?.seo?.title ?? collection?.title ?? '',
      description: truncate(
        collection?.seo?.description ?? collection?.description ?? '',
      ),
      image: collection?.image?.url,
      url: `/collections/${collection.handle}`,
      mainEntity: {
        '@type': 'ItemList',
        itemListElement,
      },
    },
  ];
}

function collection({shop, collection, collectionProducts, url}) {
  return {
    title: collection?.seo?.title ?? collection?.title,
    titleTemplate: `%s Collection | ${shop?.name}`,
    description: truncate(
      collection?.seo?.description ?? collection?.description ?? '',
    ),
    url,
    media: {
      type: 'image',
      url: collection?.image?.url,
      height: collection?.image?.height,
      width: collection?.image?.width,
      altText: collection?.image?.altText,
    },
    jsonLd: collectionJsonLd({collection, collectionProducts, url}),
  };
}

function collectionsJsonLd({url, collections}) {
  const itemListElement = collections.nodes.map((collection, index) => {
    return {
      '@type': 'ListItem',
      position: index + 1,
      url: `/collections/${collection.handle}`,
    };
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Collections',
    description: 'All collections',
    url,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement,
    },
  };
}

function listCollections({collections, url}) {
  return {
    title: 'Collections',
    titleTemplate: '%s | Collections',
    description: 'All hydrogen collections',
    url,
    jsonLd: collectionsJsonLd({collections, url}),
  };
}

function article({article, url}) {
  return {
    title: article?.seo?.title ?? article?.title,
    description: truncate(article?.seo?.description ?? ''),
    titleTemplate: '%s | Journal',
    url,
    media: {
      type: 'image',
      url: article?.image?.url,
      height: article?.image?.height,
      width: article?.image?.width,
      altText: article?.image?.altText,
    },
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      alternativeHeadline: article.title,
      articleBody: article.contentHtml,
      datePublished: article?.publishedAt,
      description: truncate(
        article?.seo?.description || article?.excerpt || '',
      ),
      headline: article?.seo?.title || '',
      image: article?.image?.url,
      url,
    },
  };
}

function blog({blog, url}) {
  return {
    title: blog?.seo?.title,
    description: truncate(blog?.seo?.description || ''),
    titleTemplate: '%s | Blog',
    url,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: blog?.seo?.title || blog?.title || '',
      description: blog?.seo?.description || '',
      url,
    },
  };
}

function page({shop, page, url}) {
  return {
    title: page?.seo?.title ?? page?.title,
    titleTemplate: `%s | ${shop?.name}`,
    description: truncate(page?.seo?.description || page?.description || ''),
    url,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: page.title,
    },
  };
}

function policy({policy, url}) {
  return {
    description: truncate(policy?.body ?? ''),
    title: policy?.title,
    titleTemplate: '%s | Policy',
    url,
  };
}

function policies({policies, url}) {
  const origin = new URL(url).origin;
  const itemListElement = policies.filter(Boolean).map((policy, index) => {
    return {
      '@type': 'ListItem',
      position: index + 1,
      name: policy.title,
      item: `${origin}/policies/${policy.handle}`,
    };
  });
  return {
    title: 'Policies',
    titleTemplate: '%s | Policies',
    description: 'Hydroge store policies',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        description: 'Hydrogen store policies',
        name: 'Policies',
        url,
      },
    ],
  };
}

export const seoPayload = {
  article,
  blog,
  collection,
  home,
  listCollections,
  page,
  policies,
  policy,
  product,
  root,
};

/**
 * Truncate a string to a given length, adding an ellipsis if it was truncated
 * @param str - The string to truncate
 * @param num - The maximum length of the string
 * @returns The truncated string
 * @example
 * ```js
 * truncate('Hello world', 5) // 'Hello...'
 * ```
 */
function truncate(str, num = 155) {
  if (typeof str !== 'string') return '';
  if (str.length <= num) {
    return str;
  }
  return str.slice(0, num - 3) + '...';
}
