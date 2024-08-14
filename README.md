# Sessions - One-on-One Video Consultation Platform 🔥

*You can [raise an issue][sessions-issues] with [this][sessions-issues] link*

## Table of contents

- [Sessions](#sessions---one-on-one-video-consultation-platform-)
    - [Table of contents](#table-of-contents)
    - [Project Overview](#project-overview)
    - [Core Features](#core-features)
        - [User Registration and Profiles](#1-user-registration-and-profiles)
        - [Expert Registration and Profiles](#2-expert-registration-and-profiles)
        - [Session Booking](#3-session-booking)
        - [Session Management](#4-session-management)
        - [Payment System](#5-payment-system)
        - [Feedback and Ratings](#6-feedback-and-ratings)
    - [Todo](#todo)
    - [Installation](#installation)
        - [Clone Repo](#clone-repo)
        - [Install Dependencies](#install-dependencies)
        - [Create environment](#create-environment)
        - [Run Project](#run-project)
    - [License](#license)
    - [Contribute](#contribute)
    - [Contact](#contact)

## Project Overview

**Sessions** is an open-source web platform that allows users to book one-on-one video calls with a variety of experts
across different fields. Whether you're seeking advice on business, fitness, career development, or any other area,
**Sessions** connects you with professionals who can provide personalized guidance.

This project is being developed with full transparency. All code and progress updates are shared openly for educational
purposes, offering insights into the development of a production-ready, enterprise-scale software application.

## Core Features

### 1. User Registration and Profiles

* **Sign-Up/Sign-In:** Allow users to create accounts via email or social media.
* **Profile Creation:** Users can create profiles that include personal information, interests, and areas where they
  seek advice.

### 2. Expert Registration and Profiles

* **Sign-Up/Sign-In:** Allow experts to register and create profiles.
* **Profile Details:** Experts can list their areas of expertise, experience, and availability.
* **Verification Process:** Implement a simple vetting or verification process to ensure credibility.

### 3. Session Booking

* **Search and Discovery:** Users can search for experts by category, expertise, or name.
* **Availability and Booking:** Users can view expert availability and book sessions directly through the platform.
* **Calendar Integration:** Sync with Google Calendar for seamless scheduling.

### 4. Session Management

* **Video/Audio Calls:** Integrate a third-party API like Google Meet or Zoom for conducting sessions.
* **Session Reminders:** Automated email or SMS reminders for upcoming sessions.

### 5. Payment System

* **Pricing Structure:** Experts can set their rates per session.
* **Payment Gateway:** Integrate a secure payment processor like Stripe or PayPal for transactions.
* **Payouts:** System for transferring earnings to experts after sessions.

### 6. Feedback and Ratings

* **Post-Session Reviews:** Users can leave feedback and ratings for experts after sessions.
* **Expert Ratings:** Display average ratings on expert profiles.

## TODO

- [ ] Project Setup
- [ ] Registration
- [ ] Login

## Installation

### Clone Repo

Clone the project with git.

```bash
git clone https://github.com/Yon12853/sessions-backend.git
```

### Install Dependencies

Install all the required dependencies.

```bash
yarn install
```

### Create environment

Create a new environment file by duplicating `env.example`, then modify the values to match your specific environment
settings.

```bash
cp .env.example .env
```

### Run Project

Now you can run the project.

```bash
yarn start:dev
```

## License

Distributed under [MIT licensed][license].

## Contribute

How to contribute in this repo

1. Fork the repository
2. Create your branch `git checkout -b your-branch`
3. Commit your changes `git commit -m 'your new feature'`
4. Push your changes to your remote branch `git push origin feature-branch-name`
5. Create a Pull Request.

Please ensure your code adheres to the project's coding standards and is well-documented. 

**Note:** If your code is behind the `original/main` branch, please update your code and resolve any conflicts.

## Contact

[Yonas Halefom][author-email]

[![Github][github-shield]][author-github]
[![LinkedIn][linkedin-shield]][author-linkedin]

<!-- BADGE LINKS -->

[github-shield]: https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white
[linkedin-shield]: https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white

<!-- CONTACTS -->

[author-linkedin]: https://www.linkedin.com/in/yonashalefom/

[author-email]: mailto:contact@yonashalefom.com

[author-github]: https://github.com/Yon12853

<!-- Repository Links -->

[sessions-issues]: https://github.com/Yon12853/sessions-backend/issues

<!-- License -->

[license]: LICENSE.md
