# Platform entry: everything needed, ready to paste

Checked against `loops project fields` on 24 Nov 2026. The platform **will not create** the entry until the six required fields below exist. Nothing is submitted until the owner says yes: the CLI drafts first, and `--confirm` is only added after approval.

## Critical path (deadline 7 Dec 09:00 GMT; AskBots round 2 reviews registered projects on 4 Dec)
1. About 0.062 CELO to the agent wallet `0x387c6EE644f472569d773a4FA9bB047007B9bB08` (Celo network).
2. `npm run erc8004:register` (dry run says "enough"), then `npm run erc8004:register -- --send` and type `register`. This gives the **ERC-8004 agent ID**.
3. Create the entry (below). This registers the repo, so reviews and judging can see it.
4. Then the rest: Agent Vault login + $3, deploy, video, screenshots, X post.

## Required fields and where each comes from
| Field | Value / source |
|---|---|
| Project name | `Launchmate` |
| Repository URL | `https://github.com/nofazechris/LaunchMate` |
| Tagline | An AI business agent for first-time founders. It acts only within limits the owner sets, and never sees a password. |
| Attribution tag | `celo_b02f2c0e5298` (platform-issued) |
| Agent wallet | `0x387c6EE644f472569d773a4FA9bB047007B9bB08` |
| **ERC-8004 agent ID** | from step 2 (blocked on CELO) |
| **Payout wallet on Celo** | owner's own address that can receive CELO prizes (public address only) |
| **Team contacts** | owner: name, email, Telegram, X handle (owner's own details) |
| **Founder/Project handles on X** | owner's X handle(s) |
| **Follow @Celo and @CeloDevs on X** | owner follows both, then answers `Yes` |
| **Named user** | see below: owner chose not to name the merchant |
| Demo URL, video, screenshots, logo | after deploy / recording (see DEMO_SCRIPT.md) |

### Named user (the merchant stays unnamed)
The field asks who uses the agent, the job it does, and where users and volume came from. A truthful answer that names no one:

> A small clothing seller in Nigeria, who asked not to be named. Launchmate helps set up their online business: their business plan, their product catalogue with photos and stock, and their domain setup through Agent Vault. Volume and users so far: one real merchant, introduced by the founder; no other users yet.

Do not claim more than is true. If the merchant has not yet used the product for real, say so and describe the plan instead.

### Description (honest, current)
> Launchmate helps first-time founders in Nigeria set up and run an online business. Today you can create an account, describe your business in a guided flow, and manage real products with photos, prices and stock. Its agent works through Agent Vault: it signs in to the owner's accounts, such as a domain registrar, without ever seeing the password, and pays for services over x402 on Celo within a spending limit the owner sets, with each payment approved by the owner. Early access: the storefront, payments and the business agent are still being built.

## Command (run only after the owner approves the draft text)
```powershell
loops project create -e agents-open-for-business `
  --name "Launchmate" `
  --repoUrl "https://github.com/nofazechris/LaunchMate" `
  --tagline "An AI business agent for first-time founders. It acts only within limits the owner sets, and never sees a password." `
  --description "<description above>" `
  --answer "Attribution tag=celo_b02f2c0e5298" `
  --answer "Agent wallet=0x387c6EE644f472569d773a4FA9bB047007B9bB08" `
  --answer "ERC-8004 agent ID=<id from step 2>" `
  --answer "Payout wallet on Celo=<owner address>" `
  --answer "Team contacts=<owner details>" `
  --answer "Named user=<text above>" `
  --answer "Founder and/or Project Handles on X=<handle>" `
  --answer "Follow @Celo and @CeloDevs on X=Yes"
```
Run without `--confirm` first: it prints the exact draft and what is still missing. Add `--confirm` only after the owner says yes. Later fields are added with `loops project update ... --demoUrl/--videoUrl/--screenshot/--logo`.

## Public X post (required for the Agent Vault track)
A post from the owner's account, with a demo clip and the repo link, tagging @selfxyz and @Celo. Draft (edit freely, keep it true):

> Building Launchmate: an AI business agent for first-time founders in Nigeria. It signs in to your accounts through @selfxyz Agent Vault without ever seeing your password, and pays for services over x402 on @Celo within a limit you set. Early access, built for the Agents Open for Business hackathon. Repo: https://github.com/nofazechris/LaunchMate

Post it only once the demo clip shows something real that happened.
