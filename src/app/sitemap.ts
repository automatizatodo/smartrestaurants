import type { MetadataRoute } from 'next';
import restaurantConfig from '@/config/restaurant.config'; // Assuming NEXT_PUBLIC_APP_URL might be defined here or in .env

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!baseUrl) {
    // Fallback if NEXT_PUBLIC_APP_URL is not set.
    // YOU SHOULD IDEALLY SET THIS IN YOUR ENVIRONMENT VARIABLES FOR PRODUCTION.
    console.warn(
      "WARNING: NEXT_PUBLIC_APP_URL is not set. Using a placeholder URL for sitemap.xml. Please set this environment variable for production."
    );
    // Using a placeholder, but this makes the sitemap less useful if not updated.
    const fallbackUrl = 'https://example.com'; // Replace if you have a known default or handle error
    return [
      {
        url: `${fallbackUrl}/`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'weekly',
        priority: 1.0,
      },
      {
        url: `${fallbackUrl}/menu`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
    ];
  }

  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/menu`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // Add other static pages here if you have them
    // e.g., { url: `${baseUrl}/about`, lastModified: new Date().toISOString() }
  ];

  // If you had dynamic routes, e.g., blog posts, you would fetch them here
  // and add them to the 'routes' array.
  // Example:
  // const posts = await fetchAllBlogPosts(); // Your function to get post slugs/ids
  // posts.forEach(post => {
  //   routes.push({
  //     url: `${baseUrl}/blog/${post.slug}`,
  //     lastModified: new Date(post.updatedAt).toISOString(),
  //     changeFrequency: 'monthly',
  //   });
  // });

  return routes;
}
