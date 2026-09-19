"""
Populate the local dev database with realistic demo data for browser review:
users, communities, memberships, posts (with agricultural photos), comments,
likes, follows, and market prices. Safe to re-run (skips if already seeded).
"""

import random
from datetime import timedelta

from app import create_app
from extensions import db
from models import (
    Comment,
    Community,
    CommunityMembership,
    Follow,
    Like,
    MarketPrice,
    Post,
    PostImage,
    User,
)
from utils.timeutils import utcnow

AVATAR = "https://i.pravatar.cc/300?img={}"

POST_IMAGES = [
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=75&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1567547921486-f280c2f53b5d?w=1200&q=75&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1753866551936-998e5fcf6d5f?w=1200&q=75&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1519082572439-7ed19908e47e?w=1200&q=75&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1744986924545-08e6d543bd84?w=1200&q=75&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1515694590185-73647ba02c10?w=1200&q=75&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=1200&q=75&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1757777598981-2a589811168d?w=1200&q=75&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&q=75&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&q=75&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?w=1200&q=75&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&q=75&fit=crop&auto=format",
]

COMMUNITY_IMAGES = [
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=75&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?w=800&q=75&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=75&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=75&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1519082572439-7ed19908e47e?w=800&q=75&fit=crop&auto=format",
]

USERS = [
    # username, email, role, bio, location, is_expert
    (
        "wanjiku_farms",
        "wanjiku@agrilink.test",
        "user",
        "Third-generation maize and bean farmer in Nakuru. Always experimenting with intercropping.",
        "Nakuru, Kenya",
        False,
    ),
    (
        "oduya_agrivet",
        "oduya@agrilink.test",
        "expert",
        "Agricultural extension officer, 15 years in crop pathology. Ask me about pests and disease.",
        "Kisumu, Kenya",
        True,
    ),
    (
        "amara_greens",
        "amara@agrilink.test",
        "user",
        "Smallholder vegetable farmer. Kale, tomatoes, and spinach for the local market.",
        "Kampala, Uganda",
        False,
    ),
    (
        "dr_naledi_soil",
        "naledi@agrilink.test",
        "expert",
        "Soil scientist, PhD. Consulting on soil health and fertility management across East Africa.",
        "Gaborone, Botswana",
        True,
    ),
    (
        "kofi_cocoa",
        "kofi@agrilink.test",
        "user",
        "Cocoa and cassava farmer. Third generation on this land.",
        "Kumasi, Ghana",
        False,
    ),
    (
        "fatima_livestock",
        "fatima@agrilink.test",
        "user",
        "Dairy and poultry farmer. Also running a small feed supply business.",
        "Arusha, Tanzania",
        False,
    ),
    (
        "prof_okello_agronomy",
        "okello@agrilink.test",
        "expert",
        "Agronomy professor. Research focus on drought-resistant crop varieties.",
        "Kampala, Uganda",
        True,
    ),
    (
        "grace_coffee",
        "grace@agrilink.test",
        "user",
        "Coffee farmer at 1800m altitude. Specialty arabica, direct trade.",
        "Nyeri, Kenya",
        False,
    ),
    (
        "samuel_ricegrower",
        "samuel@agrilink.test",
        "user",
        "Rice farmer in the Mwea irrigation scheme.",
        "Mwea, Kenya",
        False,
    ),
    (
        "aisha_agritech",
        "aisha@agrilink.test",
        "expert",
        "Agritech consultant helping farmers adopt precision agriculture tools.",
        "Lagos, Nigeria",
        True,
    ),
    (
        "museveni_orchard",
        "mus@agrilink.test",
        "user",
        "Mango and avocado orchard owner. Exporting to regional markets.",
        "Mbale, Uganda",
        False,
    ),
    (
        "thandiwe_permaculture",
        "thandiwe@agrilink.test",
        "user",
        "Permaculture designer, teaching regenerative farming workshops.",
        "Harare, Zimbabwe",
        False,
    ),
]

COMMUNITIES = [
    (
        "Maize Growers Network",
        "Tips, market info, and troubleshooting for maize farmers across East Africa.",
        0,
    ),
    (
        "Organic & Regenerative Farming",
        "Sharing regenerative practices, composting, and organic pest control.",
        1,
    ),
    (
        "Coffee & Tea Growers",
        "For smallholder coffee and tea farmers — processing, pricing, and quality tips.",
        2,
    ),
    ("Livestock & Dairy", "Poultry, dairy, and livestock health discussions.", 3),
    (
        "Irrigation & Water Management",
        "Discussing irrigation schemes, drip systems, and water-saving techniques.",
        4,
    ),
]

POSTS = [
    (
        "Fall armyworm hitting my maize hard this season",
        "Anyone else seeing fall armyworm damage this early? I've tried neem extract but it's not keeping up. Looking for advice from anyone who's dealt with a bad outbreak.",
        "Maize Growers Network",
    ),
    (
        "Intercropping maize with beans — first results",
        "Tried intercropping this season on 2 acres. Yields look promising and the beans are fixing nitrogen nicely. Happy to share what spacing worked for me.",
        "Maize Growers Network",
    ),
    (
        "Best compost ratio for vegetable beds?",
        "I've been composting kitchen waste and crop residue but my compost is too wet. What's a good carbon:nitrogen ratio for tropical climates?",
        "Organic & Regenerative Farming",
    ),
    (
        "Switched to zero-till this year, small update",
        "Three months into zero-till on my vegetable plot. Soil moisture retention is noticeably better even in the dry spells we've had.",
        "Organic & Regenerative Farming",
    ),
    (
        "Arabica cherry prices this week",
        "Cherry prices at the local cooperative are up about 8% from last month. Good time to sell if you're holding stock.",
        "Coffee & Tea Growers",
    ),
    (
        "Coffee berry disease — early signs to watch for",
        "Sharing photos of early coffee berry disease symptoms so others can catch it before it spreads. Copper-based fungicide worked for me last season.",
        "Coffee & Tea Growers",
    ),
    (
        "Newcastle disease outbreak in my poultry",
        "Lost a dozen birds this week to what the vet confirmed as Newcastle disease. Vaccinating the rest of the flock now. Anyone have a good vaccination schedule?",
        "Livestock & Dairy",
    ),
    (
        "Milk yield dropped after feed change",
        "Switched dairy feed suppliers last month and yield dropped noticeably. Going back to the old supplier but curious if others have had this issue.",
        "Livestock & Dairy",
    ),
    (
        "Drip irrigation on a budget — what I learned",
        "Set up a basic drip system for under $200 covering half an acre. Sharing the parts list and layout that worked for me.",
        "Irrigation & Water Management",
    ),
    (
        "Borehole water is too saline for some crops",
        "Tested our borehole water and salinity is higher than expected. Which crops are more salt-tolerant for irrigation in these conditions?",
        "Irrigation & Water Management",
    ),
    (
        "Rice paddy water management during dry spells",
        "Mwea scheme farmers — how are you managing paddy flooding schedules with the reduced canal flow this month?",
        "Maize Growers Network",
    ),
    (
        "Avocado orchard spacing recommendations?",
        "Planning a new Hass avocado block. What spacing has worked best for others in similar climates?",
        "Organic & Regenerative Farming",
    ),
]

COMMENTS = [
    "This is really helpful, thank you for sharing!",
    "I had the exact same issue last season. What worked for me was rotating crops.",
    "Great write-up. Following for updates.",
    "Have you tried consulting your local extension officer about this?",
    "Prices in our area are similar right now, good to see confirmation.",
    "Would love to see photos if you have any.",
    "This matches what I've been seeing too.",
    "Thanks for the detailed breakdown, saving this post.",
    "Did you notice any difference in soil pH after that change?",
    "Appreciate you posting the numbers, very useful for planning.",
]

MARKET_PRICES = [
    ("Maize", 3200, "per 90kg bag", "Nakuru, Kenya"),
    ("Beans", 8500, "per 90kg bag", "Nakuru, Kenya"),
    ("Coffee Cherry (AA)", 145, "per kg", "Nyeri, Kenya"),
    ("Rice (paddy)", 5800, "per 90kg bag", "Mwea, Kenya"),
    ("Cocoa", 1200, "per kg", "Kumasi, Ghana"),
    ("Milk", 55, "per litre", "Arusha, Tanzania"),
    ("Avocado (Hass)", 30, "per kg", "Mbale, Uganda"),
    ("Kale (Sukuma Wiki)", 40, "per bundle", "Kampala, Uganda"),
]


def run():
    app = create_app()
    with app.app_context():
        if User.query.filter_by(username="wanjiku_farms").first():
            print("Demo data already present, skipping.")
            return

        users = []
        for i, (username, email, _role, bio, location, is_expert) in enumerate(USERS):
            u = User(
                username=username,
                email=email,
                bio=bio,
                location=location,
                profile_image_url=AVATAR.format(i + 5),
                email_verified=True,
            )
            u.set_password("Password123!")
            u.set_role_by_name("expert" if is_expert else "user")
            db.session.add(u)
            users.append(u)
        db.session.commit()

        communities = []
        for i, (name, description, creator_idx) in enumerate(COMMUNITIES):
            c = Community(
                name=name,
                description=description,
                image_url=COMMUNITY_IMAGES[i % len(COMMUNITY_IMAGES)],
                created_by=users[creator_idx].id,
            )
            db.session.add(c)
            db.session.flush()
            communities.append(c)
        db.session.commit()

        # Everyone joins 2-4 random communities (creator is auto-member).
        for c in communities:
            db.session.add(CommunityMembership(user_id=c.created_by, community_id=c.id))
        for u in users:
            for c in random.sample(communities, k=random.randint(2, 4)):
                exists = CommunityMembership.query.filter_by(
                    user_id=u.id, community_id=c.id
                ).first()
                if not exists:
                    db.session.add(CommunityMembership(user_id=u.id, community_id=c.id))
        db.session.commit()

        community_by_name = {c.name: c for c in communities}
        posts = []
        now = utcnow()
        for i, (title, content, community_name) in enumerate(POSTS):
            author = random.choice(users)
            post = Post(
                author_id=author.id,
                community_id=community_by_name[community_name].id,
                title=title,
                content=content,
                created_at=now - timedelta(hours=random.randint(1, 24 * 14)),
            )
            db.session.add(post)
            db.session.flush()
            if random.random() < 0.7:
                db.session.add(
                    PostImage(post_id=post.id, image_url=POST_IMAGES[i % len(POST_IMAGES)])
                )
            posts.append(post)
        db.session.commit()

        # Likes + comments.
        for post in posts:
            likers = random.sample(users, k=random.randint(0, min(6, len(users))))
            for u in likers:
                db.session.add(Like(user_id=u.id, post_id=post.id))
            commenters = random.sample(users, k=random.randint(0, 4))
            for u in commenters:
                db.session.add(
                    Comment(
                        user_id=u.id,
                        post_id=post.id,
                        content=random.choice(COMMENTS),
                        created_at=post.created_at + timedelta(hours=random.randint(1, 48)),
                    )
                )
        db.session.commit()

        # Follows: each user follows 2-5 others.
        for u in users:
            others = [o for o in users if o.id != u.id]
            for target in random.sample(others, k=random.randint(2, 5)):
                exists = Follow.query.filter_by(follower_id=u.id, followed_id=target.id).first()
                if not exists:
                    db.session.add(Follow(follower_id=u.id, followed_id=target.id))
        db.session.commit()

        # Market prices.
        for crop, price, unit, location in MARKET_PRICES:
            db.session.add(
                MarketPrice(
                    crop=crop,
                    price=price,
                    unit=unit,
                    location=location,
                    posted_by=random.choice(users).id,
                )
            )
        db.session.commit()

        print(
            f"Seeded {len(users)} users, {len(communities)} communities, {len(posts)} posts, {len(MARKET_PRICES)} market prices."
        )


if __name__ == "__main__":
    run()
