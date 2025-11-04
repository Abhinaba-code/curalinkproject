# **App Name**: CuraLink

## Core Features:

- AI-Powered Clinical Trial Discovery: Utilize AI to match patients with relevant clinical trials based on their medical profile and research interests, incorporating data from ClinicalTrials.gov API and other sources.  The LLM will use eligibility criteria parsing and location-based filtering tool to find clinical trials suitable for a specific user.
- Medical Publication Summarization: Integrate PubMed and other medical publication APIs to provide AI-driven summaries of research papers, helping patients and researchers quickly grasp key findings.
- Health Expert Discovery: Enable patients and researchers to find relevant health experts and collaborators, leveraging data from ORCID, Semantic Scholar, and OpenAlex. The AI-powered discovery tool will consider co-author networks and shared research interests.
- Personalized Patient Dashboard: Create a widget-based patient dashboard with real-time data fetching, personalized feeds, health insights cards, and quick action buttons.
- Researcher Profile and Collaboration Tools: Provide researchers with profiles, publication auto-import, expertise tagging, and tools for collaboration requests and shared interest highlighting.
- Forum System with Moderation: Develop a forum system for discussions, Q&A, and community support, with features like nested replies, upvotes/downvotes, expert verification, and moderation tools for researchers.
- Complete Authentication System with Protected Routes: Implement a complete authentication flow with custom styling, email verification, password reset, protected routes, session persistence, and OAuth integration with Google. JWT will be stored in the browser's local storage.

## Style Guidelines:

- Primary color: Soft medical teal (#00A8A3) to convey trust and a healthcare focus.
- Background color: Very light greenish-blue (#E0F8F7), nearly desaturated, providing a calm backdrop for content.
- Accent color: Deep purple (#6C5CE7) to provide a vibrant highlight on UI elements.
- Body font: 'Inter' (sans-serif) for clear, accessible UI text.
- Headline font: 'Playfair' (serif) to convey elegance and a modern feel.
- Phosphor Icons, supplemented by custom healthcare SVGs to convey trustworthiness and a soft design.
- Glassmorphism cards, smooth gradients, micro-interactions, and skeleton loaders for a modern and engaging UI.
- Subtle page transitions, hover effects, loading states with medical-themed animations.