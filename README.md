# Kumaon Hostel IIT Delhi — Leadership Archive

Static website using HTML, CSS, JavaScript and a public Google Sheets CSV feed.

## Run locally
Open index.html with VS Code Live Server or run `python3 -m http.server 5500` in this folder and visit http://localhost:5500.

## Connect Google Sheets
1. Create a Google Sheet with headers exactly `Name`, `Role`, `Year`, `Photo`.
2. Only include approved, public information. Photo values must be direct publicly accessible image URLs.
3. Google Sheets: File > Share > Publish to web; select the correct sheet tab and CSV format; publish.
4. Copy the resulting published CSV URL into `GOOGLE_SHEET_CSV_URL` in script.js.
5. Reload the page. Changes will appear after the next fetch, subject to Google caching.
6. Do not use private sheet data; publishing exposes the contents to anyone with access to the URL.

## Customize
- Replace `assets/hostel-hero.jpg` with an approved hostel photograph. The site uses a gradient if missing.
- Replace the placeholder email `YOUR_APPROVED_CONTACT_EMAIL` in index.html.
- Replace demonstration records by connecting the real sheet before publishing.
- Obtain permission for photographs, logos, and any personal details.

## Deploy to Netlify
1. Push this folder to a GitHub repository (index.html must be at repository root).
2. Netlify: Add new project > Import an existing project > GitHub > select repository.
3. Build command: leave blank. Publish directory: `.` (project root).
4. Deploy. Set your desired site name under domain management if available.
5. Subsequent pushes to the production branch trigger redeployments.

## Notes
- Google Sheets updates do not require redeployment; they are fetched when the page loads.
- Publishing changes may be cached by Google; updates are not necessarily instant.
- The example is an original design, not an official IIT Delhi website or a copy of CAIC.
