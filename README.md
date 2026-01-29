# Software Construction Assignment 1: Behind the App

**App Selected**: Instagram  
**Group Members**:
*   **Coordinator**: Asingura Philip
*   **App Analyst**: Mokili Promise Pierre
*   **System Thinker**: Geno Owor Joshua
*   **Risk and Change Analyst**: Nkangi Moses
*   **Documentation Lead**: Kasingye Leone
  

## 1. Introduction
This document provides an engineering analysis of **Instagram**, a widely used social networking service. We move beyond the user experience to understand the architectural, design, and maintenance decisions that allow the platform to serve billions of users globally.

---

## Part A: Understanding the App

### App Overview
**Instagram** is a visual-first social media platform centered around sharing photos and videos.
*   **Problem Solved**: It solves the problem of visual storytelling and social connection, allowing users to capture, edit, and share moments instantly with a global audience.
*   **Primary Users**: Individuals (social connection), Creators (content monetization), Businesses (marketing & sales).

### Core Features
1.  **Feed**: Algorithmically curated stream of photos and videos from followed accounts and recommended content.
2.  **Stories**: Ephemeral 24-hour content (photos/videos) that encourages frequent, low-friction sharing.
3.  **Direct Messaging (DM)**: Real-time text, voice, and media chat for private communication.
4.  **Reels**: Short-form, scrolling video content (TikTok-style) driven by an interest graph.
5.  **Search & Explore**: Discovery engine allowing users to find new content and accounts based on interests.

---

## Part B: Thinking Behind the Scenes
**(Backend)**

| Feature | User Interface (UI) | Business Logic | Network / APIs | Data Storage |
| :--- | :--- | :--- | :--- | :--- |
| **Feed** | Infinite scroll list, image carousels, double-tap to like. | Creating the "interest graph", ranking posts, inserting ads, filtering NSFW content. | REST/GraphQL APIs to fetch paginated posts. **Connectivity**: Required (but caches previous posts). | **Graph DB** (e.g., TAO) for relationships, **Cassandra** for feed data. |
| **Stories** | Top-bar circular avatars, tap navigation, overlays/stickers. | 24hr expiration timer, view counting, privacy rules (Close Friends). | HTTP requests to upload/fetch media. **Connectivity**: Required (offline uploads queue up). | **Object Storage** (S3/Haystack) for images/video. |
| **Reels** | Full-screen video player, vertical swipe gestures. | Recommendation engine (ML), video transcoding, adaptive bitrate streaming. | Streaming protocols (**HLS**/DASH) for video playback. | **CDN** (Content Delivery Network) for low-latency video delivery. |
| **DMs** | Chat bubbles, typing indicators, read receipts. | Message routing, push notifications, encryption keys management. | **WebSockets** for real-time bi-directional communication. | **HBase/Cassandra** for message history. |

### Technical Architecture Notes
*   **TAO (The Associations and Objects)**: Facebook's distributed data store optimized for social graph queries, used by Instagram for relationship data.
*   **HLS (HTTP Live Streaming)**: Apple's adaptive streaming protocol that adjusts video quality based on network conditions.
*   **DASH (Dynamic Adaptive Streaming over HTTP)**: Industry-standard protocol for adaptive video streaming.
*   **CDN (Content Delivery Network)**: Distributed network of servers that cache content closer to users, reducing latency.

### Network Connectivity
*   **Offline Behavior**: Instagram uses an "optimistic" approach. If you like a photo or send a DM while offline, the UI updates immediately, and the app queues the request to sync with the server once connectivity is restored.
*   **Slow Network**: The app uses **progressive JPEG** loading (blurry version first) and adaptive bitrate streaming (lower quality video) to keep the app responsive.

---

## Part C: Change and Maintainability
**(DevOps/SRE)**

### Scenario: Support 10× More Users
Currently, Instagram serves over **2 billion monthly active users**. Supporting 10x more users (e.g., jumping from 2B to 20B, theoretically) would be a massive engineering hurdle.

**1. Required Changes:**
*   **Database Sharding**: The user graph would become too large for any single cluster. We would need to implement aggressive sharding (partitioning data) by User ID or Region to distribute load.
*   **Edge Computing**: We would need to move more logic (caches, compute) closer to users via an expanded CDN network to prevent high latency.
*   **Data Center Expansion**: Massive increase in physical storage (exabytes of data) and compute power for video transcoding.
*   **Caching Strategy**: Implement multi-tier caching (in-memory, distributed cache, CDN) to reduce database load.
*   **Load Balancing**: Deploy advanced load balancing algorithms and auto-scaling mechanisms to handle traffic spikes.

**2. What Could Break?**
*   **Feed Generation**: Calculating a custom feed for every user in real-time is computationally expensive. At 10x scale, the "Fan-out" process (delivering a post to all followers) could lag significantly, potentially taking minutes instead of seconds.
*   **Search**: Indexing millions of new posts per minute would likely overwhelm existing search infrastructure (Elasticsearch clusters), causing search delays or failures.
*   **Media Storage**: The exponential growth in photo and video uploads could exhaust object storage capacity, requiring immediate infrastructure expansion.
*   **Real-time Features**: WebSocket connections for DMs and live updates could hit connection limits, causing service degradation.

**3. Why is it Difficult?**
*   **Consistency vs. Availability**: At this scale, keeping data consistent (e.g., your friend sees your post *instantly*) becomes nearly impossible across global regions (CAP Theorem limits). Trade-offs must be made between strong consistency and high availability.
*   **Network Latency**: Even with edge computing, cross-continental data synchronization introduces unavoidable delays.
*   **Cost Scaling**: Infrastructure costs scale non-linearly; 10x users may require 15-20x infrastructure investment due to redundancy and failover requirements.

---

## Part D: Software Construction Challenges

1.  **Scalability (Managing the "Thundering Herd")**: When a celebrity posts, millions of users request the file simultaneously. Preventing server crashes requires sophisticated caching strategies (Redis, Memcached), content delivery networks (CDNs), and intelligent load balancing across multiple data centers.

2.  **Cross-Platform Consistency**: Maintaining feature parity across iOS, Android, and Web requires massive coordination. A bug in the Android build can alienate half the user base. This challenge involves managing separate codebases, different release cycles, and platform-specific optimizations while ensuring a unified user experience.

3.  **Data Privacy & Security**: Protecting user data (DMs, private photos) while complying with global laws (GDPR, CCPA) is a continuous legal and engineering challenge. This includes implementing end-to-end encryption, secure key management, data retention policies, and user consent mechanisms.

4.  **Network Reliance**: The app must feel fast even on 3G networks in developing countries. Optimizing image compression, implementing request batching, using progressive loading, and minimizing API calls are critical for maintaining user engagement in low-bandwidth environments.

5.  **Backward Compatibility**: Not everyone updates their app. The server APIs must support versions of the app from 5 years ago without breaking new features. This requires careful API versioning, feature flags, and graceful degradation strategies.

6.  **Monitoring & Observability**: At scale, detecting and diagnosing issues requires comprehensive monitoring systems. This includes distributed tracing, real-time metrics, log aggregation, and alerting systems to identify performance bottlenecks and failures before they impact users.

---

---

## Part E: Group Reflection

1.  **Complexity Surprise**: [Discuss what surprised the group most about the app's complexity, e.g., the scale of data or real-time requirements.]
2.  **Beyond Working Code**: [Explain why just writing code is insufficient, considering maintenance, scalability, and teamwork.]
3.  **Teamwork Lessons**: [Share insights on collaboration, role division, and communication during this assignment.]

---

## Conclusion

Instagram's engineering architecture demonstrates sophisticated solutions to complex distributed systems challenges. The platform's ability to serve billions of users while maintaining real-time responsiveness relies on careful architectural decisions: distributed databases for scalability, CDNs for performance, optimistic UI updates for perceived speed, and adaptive streaming for network efficiency.

The challenges of scaling, maintaining cross-platform consistency, ensuring security, and optimizing for diverse network conditions illustrate the ongoing complexity of building and maintaining large-scale social media platforms. These engineering decisions directly impact user experience, making software construction principles critical to the platform's success.

---

## References

*   Facebook Engineering Blog - TAO: The Power of the Graph
*   Instagram Engineering - Scaling Instagram Infrastructure
*   Meta Technical Blog - Building Instagram's Feed Architecture
*   Industry standards: HLS (RFC 8216), DASH (ISO/IEC 23009-1)
*   CAP Theorem: Brewer, E. (2012). "CAP Twelve Years Later: How the 'Rules' Have Changed"


---

## Group Contributions

| Name | Role | Contribution Description |
| :--- | :--- | :--- |
| **Asingura Philip** | Coordinator | [e.g., Organized meetings, drafted Part A, final review] |
| **Mokili Promise Pierre** | App Analyst | [e.g., Identified core features, analyzed UI components] |
| **Geno Owor Joshua** | System Thinker | [e.g., Mapped out backend architecture, DB schema reasoning] |
| **Nkangi Moses** | Risk Analyst | [e.g., Developed scalability scenarios (Part C), risk analysis] |
| **Kasingye Leone** | Documentation Lead | [e.g., Formatted README, compiled references, Part D details] |
