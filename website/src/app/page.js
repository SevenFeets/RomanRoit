import ContactForm from "@/components/contact/ContactForm";
import PhotoSections from "@/components/img/PhotoSections";
import { getPublicPhotoSections } from "@/lib/photos/queries";

export default async function Home() {
  const fallbackPhotos = [
    {
      src: "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=900&q=80",
      alt: "Rescued cat resting in a blanket",
    },
    {
      src: "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?auto=format&fit=crop&w=900&q=80",
      alt: "Volunteer feeding street cats",
    },
    {
      src: "https://images.unsplash.com/photo-1511044568932-338cba0ad803?auto=format&fit=crop&w=900&q=80",
      alt: "Cat receiving a veterinary checkup",
    },
    {
      src: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=900&q=80",
      alt: "Playful rescued kitten",
    },
  ];

  const paymentOptions = [
    { name: "PayPal", detail: "paypal.me/catsafecity" },
    { name: "Bank Transfer", detail: "IBAN: XX00 0000 0000 0000 0000" },
    { name: "Venmo", detail: "@cat-rescue-city" },
    { name: "Crypto", detail: "USDT (TRC20): TQ...9QW" },
  ];

  const sponsorshipTiers = [
    {
      title: "Food Sponsor",
      amount: "$40/month",
      description: "Provides daily meals for 4-6 street cats.",
    },
    {
      title: "Medical Sponsor",
      amount: "$90/month",
      description: "Covers basic medicines, vaccinations, and checkups.",
    },
    {
      title: "Shelter Sponsor",
      amount: "$180/month",
      description: "Supports temporary foster housing and transport.",
    },
  ];

  const folderSections = await getPublicPhotoSections();

  return (
    <div className="bg-slate-50 text-slate-900">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-12 md:px-10 lg:px-14">
        <section className="rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 p-8 text-white shadow-xl md:p-12">
          <p className="mb-3 inline-flex rounded-full bg-white/20 px-3 py-1 text-sm">
            City Cat Rescue Volunteer
          </p>
          <h1 className="max-w-3xl text-3xl font-bold leading-tight md:text-5xl">
            Helping street cats find safety, food, and medical care.
          </h1>
          <p className="mt-5 max-w-2xl text-base text-emerald-50 md:text-lg">
            Every donation supports rescue missions, emergency treatment, and
            foster placement for abandoned and injured cats in our city.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="#donate"
              className="rounded-full bg-white px-5 py-2.5 font-semibold text-emerald-700 transition hover:bg-emerald-100"
            >
              Donate Now
            </a>{" "}
            <a
              href="#sponsorship"
              className="rounded-full border border-white/70 px-5 py-2.5 font-semibold text-white transition hover:bg-white/10"
            >
              Become a Sponsor
            </a>
          </div>
        </section>

        <PhotoSections sections={folderSections} fallbackPhotos={fallbackPhotos} />

        <section
          id="donate"
          className="grid gap-8 rounded-3xl bg-white p-8 shadow-sm md:grid-cols-2"
        >
          <div>
            <h2 className="text-2xl font-bold md:text-3xl">Payment Options</h2>
            <p className="mt-2 text-slate-600">
              Choose the payment method that works best for you.
            </p>
            <ul className="mt-5 space-y-3">
              {paymentOptions.map((option) => (
                <li
                  key={option.name}
                  className="rounded-xl border border-slate-200 px-4 py-3"
                >
                  <span className="block font-semibold text-slate-800">
                    {option.name}
                  </span>
                  <span className="text-sm text-slate-600">{option.detail}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl bg-emerald-50 p-6">
            <h3 className="text-xl font-bold text-emerald-800">
              Donor Information
            </h3>
            <p className="mt-3 text-slate-700">
              Monthly updates include rescue numbers, vet bills, and adoption
              outcomes. We prioritize transparency and show exactly where your
              support goes.
            </p>
            <ul className="mt-4 space-y-2 text-slate-700">
              <li>- 24 cats rescued in the last 3 months</li>
              <li>- 16 cats treated and vaccinated</li>
              <li>- 11 cats placed in safe foster homes</li>
            </ul>
            <a
              href="#contact"
              className="mt-6 inline-block rounded-full bg-emerald-700 px-5 py-2.5 font-semibold text-white transition hover:bg-emerald-800"
            >
              Request Detailed Reports
            </a>
          </div>
        </section>

        <section id="sponsorship">
          <h2 className="text-2xl font-bold md:text-3xl">
            Sponsorship Opportunities
          </h2>
          <p className="mt-2 text-slate-600">
            Partner monthly to keep rescue operations stable and sustainable.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {sponsorshipTiers.map((tier) => (
              <article
                key={tier.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <h3 className="text-lg font-bold">{tier.title}</h3>
                <p className="mt-1 text-emerald-700">{tier.amount}</p>
                <p className="mt-3 text-sm text-slate-600">{tier.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="contact"
          className="rounded-3xl bg-slate-900 p-8 text-slate-100 md:p-10"
        >
          <h2 className="text-2xl font-bold md:text-3xl">Contact Information</h2>
          <p className="mt-3 max-w-2xl text-slate-300">
            Reach out for emergency rescue tips, foster volunteering, or
            partnership discussions.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-slate-800 p-4">
              <p className="text-sm text-slate-400">Phone</p>
              <p className="mt-1 font-semibold">+1 (555) 124-6677</p>
            </div>
            <div className="rounded-xl bg-slate-800 p-4">
              <p className="text-sm text-slate-400">Email</p>
              <p className="mt-1 font-semibold">citycatrescue@email.com</p>
            </div>
            <div className="rounded-xl bg-slate-800 p-4">
              <p className="text-sm text-slate-400">Instagram</p>
              <p className="mt-1 font-semibold">@city.cat.rescue</p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-slate-700 bg-slate-800/30 p-5">
            <h3 className="text-xl font-semibold">Send a Message</h3>
            <p className="mt-2 text-sm text-slate-300">
              Share rescue details, volunteering questions, or sponsorship
              requests.
            </p>
            <div className="mt-4">
              <ContactForm />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
