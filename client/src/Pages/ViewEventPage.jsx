import React, { useState, useEffect } from "react";
import BlockRender from "../Components/PageEditor/BlockRender";
import { useEventStore } from "../store/useEventStore";
import { useBookingStore } from "../store/useBookingStore";
import { useNavigate } from "react-router-dom";

// Dummy event data for development
const dummyEventData = {
  location: {
    type: "Point",
    coordinates: [-71.0589, 42.3601],
  },
  page: {
    pageId: "69431622fe9c20e0c2add6da",
    slug: "acoustic-caf-sessions-1766004258399",
  },
  _id: "69431895131777b4c0135161",
  eventId: "69431622fe9c20e0c2add6dd",
  organizationId: "6941acceb92b2d8f1dbba855",
  title: "Acoustic Café Sessions",
  shortDescription: "A premium musical experience you won't want to miss",
  startDate: "2026-01-02T00:00:00.000Z",
  endDate: "2026-01-04T00:00:00.000Z",
  startTime: "18:30",
  endTime: "22:00",
  city: "Boston",
  state: "Massachusetts",
  country: "United States",
  eventCategory: "Music",
  coverImage:
    "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800",
  bannerImage:
    "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800",
  published: true,
  createdAt: "2025-12-17T20:54:45.172Z",
  updatedAt: "2025-12-17T20:54:45.172Z",
  __v: 0,
};

// Dummy page data (from page builder) - Follows Page Model and Block Registry structure
const dummyPageData = {
  _id: "69431622fe9c20e0c2add6da",
  title: "Acoustic Café Sessions Event Page",
  slug: "acoustic-caf-sessions-1766004258399",
  authorId: "6941acceb92b2d8f1dbba855",
  blocks: [
    {
      id: "block_hero_main",
      type: "hero",
      props: {
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        backgroundImage:
          "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1200",
        height: "600px",
        title: "An Evening of Acoustic Magic",
        subtitle:
          "Join us for an intimate musical journey featuring Boston's finest acoustic artists",
        titleSize: "56px",
        subtitleSize: "24px",
        textAlign: "center",
        overlay: "rgba(0,0,0,0.5)",
      },
      children: [],
    },
    {
      id: "block_intro_text",
      type: "text",
      props: {
        content: {
          type: "doc",
          content: [
            {
              type: "heading",
              attrs: { level: 1 },
              content: [{ type: "text", text: "🎵 About This Event" }],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  marks: [{ type: "bold" }],
                  text: "Experience the warmth and intimacy of live acoustic music",
                },
                {
                  type: "text",
                  text: " in a cozy café setting. This special evening brings together talented local artists who will captivate you with their soulful performances, heartfelt lyrics, and stunning musicianship.",
                },
              ],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Whether you're a longtime fan of acoustic music or discovering it for the first time, this event promises to be an ",
                },
                {
                  type: "text",
                  marks: [{ type: "italic" }],
                  text: "unforgettable evening",
                },
                {
                  type: "text",
                  text: " of beautiful melodies, engaging storytelling, and genuine connection.",
                },
              ],
            },
          ],
        },
        padding: "32px",
        background: "#ffffff",
      },
      children: [],
    },
    {
      id: "block_featured_artists",
      type: "text",
      props: {
        content: {
          type: "doc",
          content: [
            {
              type: "heading",
              attrs: { level: 2 },
              content: [{ type: "text", text: "🎸 Featured Artists" }],
            },
          ],
        },
        padding: "32px 32px 16px 32px",
        background: "#f8f9fa",
      },
      children: [],
    },
    {
      id: "block_artists_grid",
      type: "columns",
      props: {
        columns: 3,
        gap: "32px",
        padding: "0 32px 32px 32px",
      },
      children: [
        {
          id: "block_artist_1",
          type: "image",
          props: {
            src: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400",
            alt: "Artist performing with guitar",
            width: "100%",
            height: "250px",
            objectFit: "cover",
            borderRadius: "12px",
          },
          children: [],
        },
        {
          id: "block_artist_2",
          type: "image",
          props: {
            src: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400",
            alt: "Female vocalist with microphone",
            width: "100%",
            height: "250px",
            objectFit: "cover",
            borderRadius: "12px",
          },
          children: [],
        },
        {
          id: "block_artist_3",
          type: "image",
          props: {
            src: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=400",
            alt: "Band performing on stage",
            width: "100%",
            height: "250px",
            objectFit: "cover",
            borderRadius: "12px",
          },
          children: [],
        },
      ],
    },
    {
      id: "block_artists_names",
      type: "columns",
      props: {
        columns: 3,
        gap: "32px",
        padding: "0 32px 32px 32px",
      },
      children: [
        {
          id: "block_artist_1_info",
          type: "text",
          props: {
            content: {
              type: "doc",
              content: [
                {
                  type: "heading",
                  attrs: { level: 3 },
                  content: [{ type: "text", text: "Jake Morrison" }],
                },
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      marks: [{ type: "italic" }],
                      text: "Folk & Indie",
                    },
                  ],
                },
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "Singer-songwriter with a unique blend of folk storytelling and modern indie sensibilities.",
                    },
                  ],
                },
              ],
            },
            padding: "16px",
            background: "transparent",
          },
          children: [],
        },
        {
          id: "block_artist_2_info",
          type: "text",
          props: {
            content: {
              type: "doc",
              content: [
                {
                  type: "heading",
                  attrs: { level: 3 },
                  content: [{ type: "text", text: "Sarah Chen" }],
                },
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      marks: [{ type: "italic" }],
                      text: "Soul & Jazz",
                    },
                  ],
                },
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "Powerful vocals meet intimate acoustic arrangements in her soulful performances.",
                    },
                  ],
                },
              ],
            },
            padding: "16px",
            background: "transparent",
          },
          children: [],
        },
        {
          id: "block_artist_3_info",
          type: "text",
          props: {
            content: {
              type: "doc",
              content: [
                {
                  type: "heading",
                  attrs: { level: 3 },
                  content: [{ type: "text", text: "The Riverside Trio" }],
                },
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      marks: [{ type: "italic" }],
                      text: "Contemporary Acoustic",
                    },
                  ],
                },
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "Three talented musicians creating harmony-rich contemporary acoustic music.",
                    },
                  ],
                },
              ],
            },
            padding: "16px",
            background: "transparent",
          },
          children: [],
        },
      ],
    },
    {
      id: "block_schedule_section",
      type: "hero",
      props: {
        background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        backgroundImage: "",
        height: "400px",
        title: "Event Schedule",
        subtitle: "A night filled with amazing performances",
        titleSize: "42px",
        subtitleSize: "20px",
        textAlign: "center",
        overlay: "rgba(0,0,0,0.2)",
      },
      children: [],
    },
    {
      id: "block_schedule_details",
      type: "columns",
      props: {
        columns: 2,
        gap: "48px",
        padding: "48px 32px",
      },
      children: [
        {
          id: "block_schedule_left",
          type: "text",
          props: {
            content: {
              type: "doc",
              content: [
                {
                  type: "heading",
                  attrs: { level: 2 },
                  content: [{ type: "text", text: "📅 Timeline" }],
                },
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      marks: [{ type: "bold" }],
                      text: "6:30 PM - Doors Open",
                    },
                  ],
                },
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "Arrive early to grab the best seats and enjoy complimentary refreshments",
                    },
                  ],
                },
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      marks: [{ type: "bold" }],
                      text: "7:00 PM - Opening Set",
                    },
                  ],
                },
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "Jake Morrison kicks off the evening with his heartfelt folk melodies",
                    },
                  ],
                },
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      marks: [{ type: "bold" }],
                      text: "8:00 PM - Main Performance",
                    },
                  ],
                },
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "Sarah Chen takes the stage with her powerful vocals and soulful acoustic arrangements",
                    },
                  ],
                },
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      marks: [{ type: "bold" }],
                      text: "9:00 PM - Finale",
                    },
                  ],
                },
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "The Riverside Trio closes the night with an unforgettable collaborative performance",
                    },
                  ],
                },
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      marks: [{ type: "bold" }],
                      text: "10:00 PM - Meet & Greet",
                    },
                  ],
                },
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "Hang out with the artists, get autographs, and share your favorite moments",
                    },
                  ],
                },
              ],
            },
            padding: "24px",
            background: "#ffffff",
          },
          children: [],
        },
        {
          id: "block_schedule_right",
          type: "text",
          props: {
            content: {
              type: "doc",
              content: [
                {
                  type: "heading",
                  attrs: { level: 2 },
                  content: [{ type: "text", text: "✨ What's Included" }],
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
                              marks: [{ type: "bold" }],
                              text: "3 hours of live acoustic music",
                            },
                            {
                              type: "text",
                              text: " from three incredible acts",
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
                              marks: [{ type: "bold" }],
                              text: "Complimentary beverages",
                            },
                            {
                              type: "text",
                              text: " including coffee, tea, and soft drinks",
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
                              marks: [{ type: "bold" }],
                              text: "Light appetizers",
                            },
                            {
                              type: "text",
                              text: " and snacks throughout the evening",
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
                              marks: [{ type: "bold" }],
                              text: "Intimate venue",
                            },
                            {
                              type: "text",
                              text: " with excellent acoustics and comfortable seating",
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
                              marks: [{ type: "bold" }],
                              text: "Post-show meet & greet",
                            },
                            {
                              type: "text",
                              text: " with all performers",
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
                              marks: [{ type: "bold" }],
                              text: "Exclusive merchandise",
                            },
                            {
                              type: "text",
                              text: " available for purchase",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  type: "heading",
                  attrs: { level: 3 },
                  content: [{ type: "text", text: "🎁 VIP Perks" }],
                },
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "Upgrade to VIP for priority seating, a signed poster from all artists, and a special acoustic compilation CD!",
                    },
                  ],
                },
              ],
            },
            padding: "24px",
            background: "#fff8e1",
          },
          children: [],
        },
      ],
    },
    {
      id: "block_video_preview",
      type: "text",
      props: {
        content: {
          type: "doc",
          content: [
            {
              type: "heading",
              attrs: { level: 2 },
              content: [
                {
                  type: "text",
                  text: "🎬 Watch Previous Performance Highlights",
                },
              ],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Get a taste of what's in store! Check out this highlight reel from our last acoustic café session.",
                },
              ],
            },
          ],
        },
        padding: "48px 32px 24px 32px",
        background: "transparent",
      },
      children: [],
    },
    {
      id: "block_video_embed",
      type: "video",
      props: {
        src: "https://www.youtube.com/embed/jfKfPfyJRdk",
        width: "100%",
        height: "500px",
      },
      children: [],
    },
    {
      id: "block_venue_section",
      type: "text",
      props: {
        content: {
          type: "doc",
          content: [
            {
              type: "heading",
              attrs: { level: 2 },
              content: [{ type: "text", text: "📍 Venue Information" }],
            },
          ],
        },
        padding: "48px 32px 24px 32px",
        background: "transparent",
      },
      children: [],
    },
    {
      id: "block_venue_details",
      type: "columns",
      props: {
        columns: 2,
        gap: "32px",
        padding: "0 32px 48px 32px",
      },
      children: [
        {
          id: "block_venue_image",
          type: "image",
          props: {
            src: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600",
            alt: "Cozy café venue interior",
            width: "100%",
            height: "400px",
            objectFit: "cover",
            borderRadius: "12px",
          },
          children: [],
        },
        {
          id: "block_venue_info",
          type: "text",
          props: {
            content: {
              type: "doc",
              content: [
                {
                  type: "heading",
                  attrs: { level: 3 },
                  content: [{ type: "text", text: "The Acoustic Corner" }],
                },
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      marks: [{ type: "bold" }],
                      text: "Address:",
                    },
                    {
                      type: "text",
                      text: " 123 Harmony Street, Boston, MA 02108",
                    },
                  ],
                },
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "Located in the heart of Boston's historic downtown, The Acoustic Corner is renowned for its warm ambiance, excellent acoustics, and intimate atmosphere. This charming venue has hosted countless memorable performances and is the perfect setting for an evening of acoustic music.",
                    },
                  ],
                },
                {
                  type: "heading",
                  attrs: { level: 4 },
                  content: [{ type: "text", text: "Getting There" }],
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
                              marks: [{ type: "bold" }],
                              text: "Public Transit:",
                            },
                            {
                              type: "text",
                              text: " 5-minute walk from Park Street Station (Red/Green Line)",
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
                              marks: [{ type: "bold" }],
                              text: "Parking:",
                            },
                            {
                              type: "text",
                              text: " Multiple parking garages within 2 blocks",
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
                              marks: [{ type: "bold" }],
                              text: "Accessibility:",
                            },
                            {
                              type: "text",
                              text: " Wheelchair accessible with elevator access",
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
            background: "transparent",
          },
          children: [],
        },
      ],
    },
    {
      id: "block_testimonials",
      type: "hero",
      props: {
        background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
        backgroundImage: "",
        height: "350px",
        title: "What People Are Saying",
        subtitle:
          '"The best acoustic night I\'ve experienced in Boston!" - Sarah M.',
        titleSize: "38px",
        subtitleSize: "22px",
        textAlign: "center",
        overlay: "rgba(0,0,0,0.1)",
      },
      children: [],
    },
    {
      id: "block_reviews",
      type: "columns",
      props: {
        columns: 3,
        gap: "24px",
        padding: "48px 32px",
      },
      children: [
        {
          id: "block_review_1",
          type: "text",
          props: {
            content: {
              type: "doc",
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "⭐⭐⭐⭐⭐",
                    },
                  ],
                },
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      marks: [{ type: "italic" }],
                      text: '"Absolutely magical evening! The intimate setting and talented artists created an unforgettable experience."',
                    },
                  ],
                },
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      marks: [{ type: "bold" }],
                      text: "- Michael R.",
                    },
                  ],
                },
              ],
            },
            padding: "24px",
            background: "#ffffff",
          },
          children: [],
        },
        {
          id: "block_review_2",
          type: "text",
          props: {
            content: {
              type: "doc",
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "⭐⭐⭐⭐⭐",
                    },
                  ],
                },
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      marks: [{ type: "italic" }],
                      text: '"Perfect date night! Great music, cozy atmosphere, and wonderful hospitality. Can\'t wait for the next one!"',
                    },
                  ],
                },
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      marks: [{ type: "bold" }],
                      text: "- Jennifer & Tom L.",
                    },
                  ],
                },
              ],
            },
            padding: "24px",
            background: "#ffffff",
          },
          children: [],
        },
        {
          id: "block_review_3",
          type: "text",
          props: {
            content: {
              type: "doc",
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "⭐⭐⭐⭐⭐",
                    },
                  ],
                },
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      marks: [{ type: "italic" }],
                      text: '"The acoustics were incredible and the performers were phenomenal. A must-attend event for music lovers!"',
                    },
                  ],
                },
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      marks: [{ type: "bold" }],
                      text: "- David K.",
                    },
                  ],
                },
              ],
            },
            padding: "24px",
            background: "#ffffff",
          },
          children: [],
        },
      ],
    },
    {
      id: "block_final_cta",
      type: "text",
      props: {
        content: {
          type: "doc",
          content: [
            {
              type: "heading",
              attrs: { level: 2 },
              content: [{ type: "text", text: "🎟️ Secure Your Spot Today!" }],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Don't miss out on this incredible evening of acoustic music. Limited seats available!",
                },
              ],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  marks: [{ type: "bold" }],
                  text: "General Admission: $35",
                },
                {
                  type: "text",
                  text: " | ",
                },
                {
                  type: "text",
                  marks: [{ type: "bold" }],
                  text: "VIP Seating: $55",
                },
              ],
            },
          ],
        },
        padding: "48px 32px 24px 32px",
        background: "transparent",
      },
      children: [],
    },
    {
      id: "block_cta_buttons",
      type: "columns",
      props: {
        columns: 2,
        gap: "24px",
        padding: "0 32px 64px 32px",
      },
      children: [
        {
          id: "block_book_button",
          type: "button",
          props: {
            text: "Book General Admission",
            variant: "primary",
            padding: "18px 40px",
            url: "#book-general",
            background: "#f84464",
            color: "#ffffff",
            borderRadius: "10px",
            fontSize: "18px",
          },
          children: [],
        },
        {
          id: "block_vip_button",
          type: "button",
          props: {
            text: "Upgrade to VIP",
            variant: "secondary",
            padding: "18px 40px",
            url: "#book-vip",
            background: "#ffd700",
            color: "#000000",
            borderRadius: "10px",
            fontSize: "18px",
          },
          children: [],
        },
      ],
    },
  ],
  createdAt: "2025-12-17T20:54:45.172Z",
  updatedAt: "2025-12-17T20:54:45.172Z",
};

const ViewEventPage = () => {
  const { getEventPage, eventPage, eventData } = useEventStore();
  const {bookEvent , creatingBooking} = useBookingStore()
const navigate = useNavigate()
  useEffect(() => {
    if (eventData?.page?.pageId) {
      getEventPage(eventData.page.pageId);
    }
  }, [eventData?.page?.pageId]); // Only re-run if pageId changes

  // Don't render if no event data
  if (!eventData) {
    return (
      <div className="min-h-screen bg-[#e7dbf8] pt-20 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading event...</div>
      </div>
    );
  }

  const handleBookBtn = async (eve) => {
    navigate(`/ticket-details/${eventData.eventId}`)
  }

  return (
    <div className="min-h-screen bg-[#e7dbf8] pt-20">
      {/* Banner Section */}
      <div className="container mx-auto px-4">
        <div className="relative w-full h-[400px] rounded-xl overflow-hidden">
          <img
            src={eventData.coverImage || "/banner1.jpg"}
            alt={eventData.title}
            className="w-full h-full object-cover"
          />

          {/* Overlay gradient for better text visibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/50"></div>

          {/* Top Left Corner - Event Title */}
          <div className="absolute top-0 left-0 p-6">
            <h1 className="text-white text-3xl md:text-4xl font-bold drop-shadow-lg">
              {eventData.title}
            </h1>
          </div>

          {/* Bottom Left Corner Content */}
          <div className="absolute bottom-0 left-0 p-6">
            <div className="flex items-center gap-2 text-white mb-3">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="text-lg font-medium">{eventData.city}</span>
            </div>
            <button className="bg-[#6d27da] hover:bg-[#d63752] text-white px-8 py-3 rounded-lg font-bold text-lg transition-colors shadow-lg"
            onClick={() =>handleBookBtn(eventData)}
            >
              Book Now
            </button>
          </div>

          {/* Category Badge in Top Right */}
          <div className="absolute top-4 right-4">
            <span className="bg-[#6d27da] px-4 py-2 rounded-full text-white text-sm font-bold shadow-lg">
              {eventData.eventCategory}
            </span>
          </div>
        </div>
      </div>

      {/* Event Details Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="w-full mx-auto">
          {/* Page Builder Content */}
          <div className="p-6">
            <div className="space-y-6">
              {eventPage?.blocks?.map((block) => (
                <BlockRender key={block.id} block={block} />
              ))}
            </div>
          </div>

          {/* Sticky Book Button for Mobile */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:hidden z-50">
            <button className="w-full bg-[#f84464] hover:bg-[#d63752] text-white py-3 rounded-lg font-semibold text-lg transition-colors"
              onClick={() =>handleBookBtn(eventData)}>
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );

};

export default ViewEventPage;
