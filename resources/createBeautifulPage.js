const mongoose = require("mongoose");
require("dotenv").config();

const MONGODB_URI = process.env.MONGODB_URI;
const AUTHOR_ID = "693d7cdfd326cedffbb74b48"; // Your organization ID

// Beautiful Tech Conference Page
const beautifulPage = {
  title: "TechVision Summit 2025",
  slug: "techvision-summit-2025",
  authorId: AUTHOR_ID,
  published: true,
  blocks: [
    // Hero with background image
    {
      id: "hero-main",
      type: "hero",
      props: {
        backgroundImage:
          "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920&q=80",
        height: "600px",
        title: "TechVision Summit 2025",
        subtitle:
          "Where Innovation Meets Imagination • March 15-17, San Francisco",
        titleSize: "56px",
        subtitleSize: "22px",
        textAlign: "center",
        overlay: "rgba(15, 23, 42, 0.7)",
      },
      children: [],
    },

    // Event Highlights - 3 columns with images
    {
      id: "highlights-section",
      type: "text",
      props: {
        content: {
          type: "doc",
          content: [
            {
              type: "heading",
              attrs: { level: 2 },
              content: [{ type: "text", text: "Why Attend?" }],
            },
          ],
        },
        padding: "60px 20px 30px 20px",
        textAlign: "center",
      },
      children: [],
    },

    // Feature Cards Row
    {
      id: "features-columns",
      type: "columns",
      props: {
        columns: 3,
        gap: "30px",
        padding: "20px 40px",
      },
      children: [
        {
          id: "feature-1",
          type: "image",
          props: {
            src: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&q=80",
            alt: "World-class speakers",
            width: "100%",
            height: "200px",
            objectFit: "cover",
            borderRadius: "12px",
          },
          children: [],
        },
        {
          id: "feature-2",
          type: "image",
          props: {
            src: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&q=80",
            alt: "Networking opportunities",
            width: "100%",
            height: "200px",
            objectFit: "cover",
            borderRadius: "12px",
          },
          children: [],
        },
        {
          id: "feature-3",
          type: "image",
          props: {
            src: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&q=80",
            alt: "Hands-on workshops",
            width: "100%",
            height: "200px",
            objectFit: "cover",
            borderRadius: "12px",
          },
          children: [],
        },
      ],
    },

    // Feature descriptions
    {
      id: "features-text",
      type: "columns",
      props: {
        columns: 3,
        gap: "30px",
        padding: "0 40px 40px 40px",
      },
      children: [
        {
          id: "feature-text-1",
          type: "text",
          props: {
            content: {
              type: "doc",
              content: [
                {
                  type: "heading",
                  attrs: { level: 3 },
                  content: [{ type: "text", text: "🎤 World-Class Speakers" }],
                },
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "Learn from 50+ industry leaders, innovators, and visionaries shaping the future of technology.",
                    },
                  ],
                },
              ],
            },
            padding: "20px",
            textAlign: "center",
          },
          children: [],
        },
        {
          id: "feature-text-2",
          type: "text",
          props: {
            content: {
              type: "doc",
              content: [
                {
                  type: "heading",
                  attrs: { level: 3 },
                  content: [{ type: "text", text: "🤝 Networking" }],
                },
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "Connect with 5,000+ professionals, founders, and investors from around the world.",
                    },
                  ],
                },
              ],
            },
            padding: "20px",
            textAlign: "center",
          },
          children: [],
        },
        {
          id: "feature-text-3",
          type: "text",
          props: {
            content: {
              type: "doc",
              content: [
                {
                  type: "heading",
                  attrs: { level: 3 },
                  content: [{ type: "text", text: "🛠️ Hands-on Workshops" }],
                },
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "Participate in 30+ interactive workshops covering AI, blockchain, cloud, and more.",
                    },
                  ],
                },
              ],
            },
            padding: "20px",
            textAlign: "center",
          },
          children: [],
        },
      ],
    },

    // Full-width showcase image
    {
      id: "showcase-image",
      type: "image",
      props: {
        src: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1920&q=80",
        alt: "Conference venue",
        width: "100%",
        height: "450px",
        objectFit: "cover",
      },
      children: [],
    },

    // Schedule Section
    {
      id: "schedule-header",
      type: "text",
      props: {
        content: {
          type: "doc",
          content: [
            {
              type: "heading",
              attrs: { level: 2 },
              content: [{ type: "text", text: "📅 Event Schedule" }],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Three packed days of learning, networking, and innovation",
                },
              ],
            },
          ],
        },
        padding: "60px 20px 30px 20px",
        textAlign: "center",
      },
      children: [],
    },

    // Schedule 3 columns
    {
      id: "schedule-days",
      type: "columns",
      props: {
        columns: 3,
        gap: "24px",
        padding: "20px 40px 60px 40px",
      },
      children: [
        {
          id: "day-1",
          type: "text",
          props: {
            content: {
              type: "doc",
              content: [
                {
                  type: "heading",
                  attrs: { level: 3 },
                  content: [{ type: "text", text: "Day 1 - March 15" }],
                },
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      marks: [{ type: "bold" }],
                      text: "Opening & Keynotes",
                    },
                  ],
                },
                {
                  type: "bulletList",
                  content: [
                    {
                      type: "listItem",
                      content: [
                        {
                          type: "paragraph",
                          content: [
                            {
                              type: "text",
                              text: "9:00 AM - Registration & Breakfast",
                            },
                          ],
                        },
                      ],
                    },
                    {
                      type: "listItem",
                      content: [
                        {
                          type: "paragraph",
                          content: [
                            {
                              type: "text",
                              text: "10:00 AM - Opening Keynote",
                            },
                          ],
                        },
                      ],
                    },
                    {
                      type: "listItem",
                      content: [
                        {
                          type: "paragraph",
                          content: [
                            {
                              type: "text",
                              text: "2:00 PM - AI & Future of Work",
                            },
                          ],
                        },
                      ],
                    },
                    {
                      type: "listItem",
                      content: [
                        {
                          type: "paragraph",
                          content: [
                            {
                              type: "text",
                              text: "6:00 PM - Welcome Reception",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            padding: "24px",
            background: "#f8fafc",
            borderRadius: "12px",
          },
          children: [],
        },
        {
          id: "day-2",
          type: "text",
          props: {
            content: {
              type: "doc",
              content: [
                {
                  type: "heading",
                  attrs: { level: 3 },
                  content: [{ type: "text", text: "Day 2 - March 16" }],
                },
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      marks: [{ type: "bold" }],
                      text: "Deep Dives & Workshops",
                    },
                  ],
                },
                {
                  type: "bulletList",
                  content: [
                    {
                      type: "listItem",
                      content: [
                        {
                          type: "paragraph",
                          content: [
                            {
                              type: "text",
                              text: "9:00 AM - Breakout Sessions",
                            },
                          ],
                        },
                      ],
                    },
                    {
                      type: "listItem",
                      content: [
                        {
                          type: "paragraph",
                          content: [
                            { type: "text", text: "11:00 AM - Hands-on Labs" },
                          ],
                        },
                      ],
                    },
                    {
                      type: "listItem",
                      content: [
                        {
                          type: "paragraph",
                          content: [
                            {
                              type: "text",
                              text: "3:00 PM - Startup Showcase",
                            },
                          ],
                        },
                      ],
                    },
                    {
                      type: "listItem",
                      content: [
                        {
                          type: "paragraph",
                          content: [
                            {
                              type: "text",
                              text: "7:00 PM - Networking Dinner",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            padding: "24px",
            background: "#eff6ff",
            borderRadius: "12px",
          },
          children: [],
        },
        {
          id: "day-3",
          type: "text",
          props: {
            content: {
              type: "doc",
              content: [
                {
                  type: "heading",
                  attrs: { level: 3 },
                  content: [{ type: "text", text: "Day 3 - March 17" }],
                },
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      marks: [{ type: "bold" }],
                      text: "Closing & Celebrations",
                    },
                  ],
                },
                {
                  type: "bulletList",
                  content: [
                    {
                      type: "listItem",
                      content: [
                        {
                          type: "paragraph",
                          content: [
                            { type: "text", text: "9:00 AM - Industry Panels" },
                          ],
                        },
                      ],
                    },
                    {
                      type: "listItem",
                      content: [
                        {
                          type: "paragraph",
                          content: [
                            { type: "text", text: "12:00 PM - Award Ceremony" },
                          ],
                        },
                      ],
                    },
                    {
                      type: "listItem",
                      content: [
                        {
                          type: "paragraph",
                          content: [
                            { type: "text", text: "3:00 PM - Closing Keynote" },
                          ],
                        },
                      ],
                    },
                    {
                      type: "listItem",
                      content: [
                        {
                          type: "paragraph",
                          content: [
                            { type: "text", text: "5:00 PM - After Party 🎉" },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            padding: "24px",
            background: "#faf5ff",
            borderRadius: "12px",
          },
          children: [],
        },
      ],
    },

    // Speakers Section
    {
      id: "speakers-header",
      type: "text",
      props: {
        content: {
          type: "doc",
          content: [
            {
              type: "heading",
              attrs: { level: 2 },
              content: [{ type: "text", text: "🌟 Featured Speakers" }],
            },
          ],
        },
        padding: "40px 20px 20px 20px",
        textAlign: "center",
      },
      children: [],
    },

    // Speaker images
    {
      id: "speakers-images",
      type: "columns",
      props: {
        columns: 4,
        gap: "20px",
        padding: "0 40px",
      },
      children: [
        {
          id: "speaker-1",
          type: "image",
          props: {
            src: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80",
            alt: "Speaker 1",
            width: "100%",
            height: "250px",
            objectFit: "cover",
            borderRadius: "12px",
          },
          children: [],
        },
        {
          id: "speaker-2",
          type: "image",
          props: {
            src: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80",
            alt: "Speaker 2",
            width: "100%",
            height: "250px",
            objectFit: "cover",
            borderRadius: "12px",
          },
          children: [],
        },
        {
          id: "speaker-3",
          type: "image",
          props: {
            src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80",
            alt: "Speaker 3",
            width: "100%",
            height: "250px",
            objectFit: "cover",
            borderRadius: "12px",
          },
          children: [],
        },
        {
          id: "speaker-4",
          type: "image",
          props: {
            src: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80",
            alt: "Speaker 4",
            width: "100%",
            height: "250px",
            objectFit: "cover",
            borderRadius: "12px",
          },
          children: [],
        },
      ],
    },

    // Speaker names
    {
      id: "speakers-names",
      type: "columns",
      props: {
        columns: 4,
        gap: "20px",
        padding: "0 40px 60px 40px",
      },
      children: [
        {
          id: "speaker-name-1",
          type: "text",
          props: {
            content: {
              type: "doc",
              content: [
                {
                  type: "heading",
                  attrs: { level: 4 },
                  content: [{ type: "text", text: "James Wilson" }],
                },
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "CEO, TechCorp" }],
                },
              ],
            },
            padding: "16px",
            textAlign: "center",
          },
          children: [],
        },
        {
          id: "speaker-name-2",
          type: "text",
          props: {
            content: {
              type: "doc",
              content: [
                {
                  type: "heading",
                  attrs: { level: 4 },
                  content: [{ type: "text", text: "Sarah Chen" }],
                },
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "VP Engineering, CloudAI" }],
                },
              ],
            },
            padding: "16px",
            textAlign: "center",
          },
          children: [],
        },
        {
          id: "speaker-name-3",
          type: "text",
          props: {
            content: {
              type: "doc",
              content: [
                {
                  type: "heading",
                  attrs: { level: 4 },
                  content: [{ type: "text", text: "Michael Brown" }],
                },
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Founder, StartupX" }],
                },
              ],
            },
            padding: "16px",
            textAlign: "center",
          },
          children: [],
        },
        {
          id: "speaker-name-4",
          type: "text",
          props: {
            content: {
              type: "doc",
              content: [
                {
                  type: "heading",
                  attrs: { level: 4 },
                  content: [{ type: "text", text: "Emily Rodriguez" }],
                },
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Director, Google AI" }],
                },
              ],
            },
            padding: "16px",
            textAlign: "center",
          },
          children: [],
        },
      ],
    },

    // Ticket Section
    {
      id: "tickets-section",
      type: "hero",
      props: {
        background: "linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)",
        height: "auto",
        title: "Get Your Tickets Now",
        subtitle: "Early bird pricing ends February 28th - Save up to 40%!",
        titleSize: "42px",
        subtitleSize: "18px",
        padding: "60px 20px",
      },
      children: [],
    },

    // Ticket options
    {
      id: "ticket-options",
      type: "columns",
      props: {
        columns: 3,
        gap: "24px",
        padding: "40px",
      },
      children: [
        {
          id: "ticket-basic",
          type: "text",
          props: {
            content: {
              type: "doc",
              content: [
                {
                  type: "heading",
                  attrs: { level: 3 },
                  content: [{ type: "text", text: "Standard Pass" }],
                },
                {
                  type: "heading",
                  attrs: { level: 2 },
                  content: [{ type: "text", text: "$299" }],
                },
                {
                  type: "paragraph",
                  content: [
                    { type: "text", text: "✓ All keynotes & sessions" },
                  ],
                },
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "✓ Networking access" }],
                },
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "✓ Conference swag" }],
                },
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "✓ Lunch included" }],
                },
              ],
            },
            padding: "32px",
            background: "#ffffff",
            border: "2px solid #e5e7eb",
            borderRadius: "16px",
            textAlign: "center",
          },
          children: [],
        },
        {
          id: "ticket-pro",
          type: "text",
          props: {
            content: {
              type: "doc",
              content: [
                {
                  type: "heading",
                  attrs: { level: 3 },
                  content: [{ type: "text", text: "🔥 Pro Pass" }],
                },
                {
                  type: "heading",
                  attrs: { level: 2 },
                  content: [{ type: "text", text: "$599" }],
                },
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "✓ Everything in Standard" }],
                },
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "✓ Workshop access" }],
                },
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "✓ VIP networking dinner" }],
                },
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "✓ Recording access" }],
                },
              ],
            },
            padding: "32px",
            background: "linear-gradient(135deg, #eff6ff 0%, #faf5ff 100%)",
            border: "3px solid #3b82f6",
            borderRadius: "16px",
            textAlign: "center",
          },
          children: [],
        },
        {
          id: "ticket-vip",
          type: "text",
          props: {
            content: {
              type: "doc",
              content: [
                {
                  type: "heading",
                  attrs: { level: 3 },
                  content: [{ type: "text", text: "VIP Pass" }],
                },
                {
                  type: "heading",
                  attrs: { level: 2 },
                  content: [{ type: "text", text: "$999" }],
                },
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "✓ Everything in Pro" }],
                },
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "✓ Speaker meet & greet" }],
                },
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "✓ Priority seating" }],
                },
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "✓ 1-on-1 mentoring" }],
                },
              ],
            },
            padding: "32px",
            background: "#ffffff",
            border: "2px solid #e5e7eb",
            borderRadius: "16px",
            textAlign: "center",
          },
          children: [],
        },
      ],
    },

    // CTA Button
    {
      id: "cta-button",
      type: "button",
      props: {
        text: "🎫 Register Now - Limited Seats",
        variant: "primary",
        padding: "20px 48px",
        background: "#7c3aed",
        color: "#ffffff",
        fontSize: "20px",
        borderRadius: "12px",
        url: "/register",
      },
      children: [],
    },

    // Venue & Location
    {
      id: "venue-section",
      type: "columns",
      props: {
        columns: 2,
        gap: "0",
        padding: "60px 0 0 0",
      },
      children: [
        {
          id: "venue-image",
          type: "image",
          props: {
            src: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&q=80",
            alt: "Moscone Center San Francisco",
            width: "100%",
            height: "400px",
            objectFit: "cover",
          },
          children: [],
        },
        {
          id: "venue-info",
          type: "text",
          props: {
            content: {
              type: "doc",
              content: [
                {
                  type: "heading",
                  attrs: { level: 2 },
                  content: [{ type: "text", text: "📍 Venue" }],
                },
                {
                  type: "heading",
                  attrs: { level: 3 },
                  content: [{ type: "text", text: "Moscone Center" }],
                },
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "747 Howard Street" }],
                },
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "San Francisco, CA 94103" }],
                },
                { type: "paragraph", content: [{ type: "text", text: " " }] },
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      marks: [{ type: "bold" }],
                      text: "🚇 Transit:",
                    },
                    {
                      type: "text",
                      text: " Powell St. BART station (5 min walk)",
                    },
                  ],
                },
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      marks: [{ type: "bold" }],
                      text: "🅿️ Parking:",
                    },
                    { type: "text", text: " 5th & Mission Garage" },
                  ],
                },
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      marks: [{ type: "bold" }],
                      text: "🏨 Hotels:",
                    },
                    { type: "text", text: " Partner rates at nearby hotels" },
                  ],
                },
              ],
            },
            padding: "60px 40px",
            background: "#1e293b",
            color: "#ffffff",
          },
          children: [],
        },
      ],
    },

    // Footer
    {
      id: "footer",
      type: "text",
      props: {
        content: {
          type: "doc",
          content: [
            {
              type: "heading",
              attrs: { level: 3 },
              content: [{ type: "text", text: "TechVision Summit 2025" }],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Questions? Email us at hello@techvisionsummit.com",
                },
              ],
            },
            { type: "paragraph", content: [{ type: "text", text: " " }] },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Twitter @techvision • LinkedIn /techvision • Instagram @techvisionsummit",
                },
              ],
            },
            { type: "paragraph", content: [{ type: "text", text: " " }] },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "© 2025 TechVision Events. All rights reserved.",
                },
              ],
            },
          ],
        },
        padding: "50px 20px",
        background: "#0f172a",
        color: "#94a3b8",
        textAlign: "center",
      },
      children: [],
    },
  ],
};

// Create page function
async function createPage() {
  try {
    console.log("🚀 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected successfully!");
    console.log("📦 Database:", mongoose.connection.db.databaseName);

    const Page = require("./models/page");
    const Organization =
      mongoose.models.Organization || require("./models/organizer");

    // Delete existing page with this slug
    const existingPage = await Page.findOne({ slug: beautifulPage.slug });
    if (existingPage) {
      console.log("🗑️  Removing existing page...");
      await Organization.updateOne(
        { _id: AUTHOR_ID },
        { $pull: { drafts: existingPage._id } }
      );
      await Page.deleteOne({ slug: beautifulPage.slug });
    }

    // Create new page
    const page = new Page(beautifulPage);
    await page.save();

    // Add to organization drafts
    const org = await Organization.findByIdAndUpdate(
      AUTHOR_ID,
      { $addToSet: { drafts: page._id } },
      { new: true }
    );

    console.log("\n✨ Beautiful page created successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📄 Page ID:", page._id.toString());
    console.log("🔗 Slug:", page.slug);
    console.log("📝 Title:", page.title);
    console.log("🎨 Total blocks:", page.blocks.length);
    console.log("🏢 Organization:", org ? org.organizationName : "Not found");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n🌐 View at: /create-draft/" + page._id);
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("\n👋 Disconnected from MongoDB");
  }
}

createPage();
