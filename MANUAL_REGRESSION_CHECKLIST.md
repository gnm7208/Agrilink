# Agrilink MVP Manual Regression Checklist

This checklist covers the core MVP flows that should be tested before each release.

## Prerequisites

- Backend server running on `http://localhost:5000`
- Frontend dev server running on `http://localhost:5173`
- Database seeded with test data (optional but recommended)

## Test Flow 1: User Registration & Email Verification

- [ ] Navigate to `/register`
- [ ] Fill in username, email, password (meeting strength requirements)
- [ ] Submit registration form
- [ ] Verify success message indicates email verification required
- [ ] Check email for verification link (or check server logs in dev)
- [ ] Click verification link or use `/verify-email` page with token
- [ ] Verify email verification success message
- [ ] Attempt to login with verified account
- [ ] Verify login succeeds and user is redirected to home

## Test Flow 2: Login & Profile Management

- [ ] Navigate to `/login`
- [ ] Enter valid credentials
- [ ] Submit login form
- [ ] Verify redirect to home page
- [ ] Navigate to `/profile`
- [ ] Verify profile displays user information
- [ ] Click edit profile button/modal
- [ ] Update bio and location
- [ ] Upload profile image (if implemented)
- [ ] Save changes
- [ ] Verify profile updates are reflected

## Test Flow 3: Post Creation & Engagement

- [ ] Navigate to `/create` (must be logged in)
- [ ] Enter post content
- [ ] Select a tag (Advice/Question/Marketplace)
- [ ] Upload an image (optional)
- [ ] Submit post
- [ ] Verify post appears in home feed
- [ ] Navigate to post detail page
- [ ] Verify post content and image display correctly
- [ ] Click like button
- [ ] Verify like count increases and button shows as liked
- [ ] Click like again to unlike
- [ ] Verify like count decreases
- [ ] Add a comment
- [ ] Verify comment appears in comments list
- [ ] Verify comment content is sanitized (no XSS)

## Test Flow 4: Social Features

- [ ] Navigate to `/communities`
- [ ] Switch to "Experts" tab
- [ ] Search for an expert
- [ ] Click "Follow" on an expert
- [ ] Verify button changes to "Following"
- [ ] Switch to "Communities" tab
- [ ] Search for a community
- [ ] Click "Join" on a community
- [ ] Verify button changes to "Joined" or "Following"
- [ ] Navigate back to home
- [ ] Verify followed experts' posts appear in feed (if applicable)

## Test Flow 5: Messaging

- [ ] Navigate to `/messages`
- [ ] Verify list shows user conversations (if any exist)
- [ ] Verify list shows joined communities
- [ ] Click on a user conversation
- [ ] Verify chat interface loads
- [ ] Send a message
- [ ] Verify message appears in chat
- [ ] Navigate back to messages list
- [ ] Click on a community
- [ ] Verify community chat interface loads
- [ ] Send a message in community chat
- [ ] Verify message appears with sender info

## Test Flow 6: Image Uploads

- [ ] Navigate to `/create`
- [ ] Click "Add image" button
- [ ] Select a valid image file (JPEG/PNG/GIF/WebP)
- [ ] Verify image preview appears
- [ ] Verify image uploads successfully
- [ ] Submit post with image
- [ ] Verify post includes image in feed
- [ ] Attempt to upload file > 5MB
- [ ] Verify error message about file size
- [ ] Attempt to upload non-image file
- [ ] Verify error message about file type

## Test Flow 7: Security & Error Handling

- [ ] Attempt to access `/create` without logging in
- [ ] Verify redirect to login page
- [ ] Attempt to access `/profile` without logging in
- [ ] Verify redirect to login page
- [ ] Login with invalid credentials
- [ ] Verify generic error message (doesn't reveal if email exists)
- [ ] Create a post with HTML/script tags in content
- [ ] Verify content is sanitized (no script execution)
- [ ] Attempt to update another user's post
- [ ] Verify 403 Forbidden error

## Test Flow 8: Responsive Design

- [ ] Test on mobile viewport (< 768px)
- [ ] Verify bottom navigation appears
- [ ] Verify side navigation is hidden
- [ ] Test on tablet viewport (768px - 1024px)
- [ ] Test on desktop viewport (> 1024px)
- [ ] Verify side navigation appears
- [ ] Verify bottom navigation is hidden
- [ ] Verify all pages are usable on mobile

## Test Flow 9: Rate Limiting (Optional)

- [ ] Attempt rapid registration requests (> 3 per minute)
- [ ] Verify rate limit error after threshold
- [ ] Attempt rapid login requests (> 5 per minute)
- [ ] Verify rate limit error after threshold
- [ ] Attempt rapid post creation (> 30 per minute)
- [ ] Verify rate limit error after threshold

## Test Flow 10: Edge Cases

- [ ] Create post with very long content
- [ ] Verify content is truncated or scrollable appropriately
- [ ] Search for non-existent expert/community
- [ ] Verify "No results" message
- [ ] Navigate to non-existent post ID
- [ ] Verify 404 error page
- [ ] Test pagination on posts feed
- [ ] Verify "Load More" works correctly
- [ ] Test with slow network connection
- [ ] Verify loading states appear appropriately

## Notes

- All tests should be performed in a clean browser session (or incognito mode)
- Clear browser storage between major test flows if needed
- Document any bugs or issues found during testing
- Test with different user roles if applicable (regular user vs admin)

## Sign-off

- [ ] All critical flows pass
- [ ] No blocking bugs found
- [ ] Performance is acceptable
- [ ] Ready for deployment

**Tester:** _________________  
**Date:** _________________  
**Version:** _________________
