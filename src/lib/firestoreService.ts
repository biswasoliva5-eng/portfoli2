import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase.js';
import {
  PortfolioData,
  SiteSettings,
  Artwork,
  Category,
  Exhibition,
  AboutContent,
  ContactMessage,
  SocialLink,
  CVDoc
} from '../types.js';
import { defaultPortfolioData, defaultSettings } from '../data/defaultPortfolioData.js';

const SETTINGS_DOC = 'site_settings/global';
const ABOUT_DOC = 'about/content';
const CV_DOC = 'site_settings/cv';
const SOCIAL_DOC = 'site_settings/social_links';

/**
 * Loads entire portfolio data from Cloud Firestore database.
 * If database is empty on first run, it seeds initial data to Firestore.
 */
export async function getFirestorePortfolioData(): Promise<PortfolioData | null> {
  try {
    // 1. Check settings
    const settingsDocRef = doc(db, 'site_settings', 'global');
    const settingsSnap = await getDoc(settingsDocRef);

    if (!settingsSnap.exists()) {
      // First time initialization: seed Firestore with default dataset
      console.log('Seeding initial portfolio data to Cloud Firestore...');
      await seedInitialFirestoreData(defaultPortfolioData);
      return defaultPortfolioData;
    }

    const settings = { ...defaultSettings, ...settingsSnap.data() } as SiteSettings;

    // 2. Fetch artworks
    const artworksSnap = await getDocs(collection(db, 'artworks'));
    const artworks: Artwork[] = [];
    artworksSnap.forEach((d) => {
      artworks.push({ ...d.data(), id: d.id } as Artwork);
    });

    // 3. Fetch categories
    const catSnap = await getDocs(collection(db, 'categories'));
    const categories: Category[] = [];
    catSnap.forEach((d) => {
      categories.push({ ...d.data(), id: d.id } as Category);
    });
    categories.sort((a, b) => (a.order || 0) - (b.order || 0));

    // 4. Fetch exhibitions
    const exhSnap = await getDocs(collection(db, 'exhibitions'));
    const exhibitions: Exhibition[] = [];
    exhSnap.forEach((d) => {
      exhibitions.push({ ...d.data(), id: d.id } as Exhibition);
    });
    exhibitions.sort((a, b) => Number(b.year || 0) - Number(a.year || 0));

    // 5. Fetch about content
    const aboutSnap = await getDoc(doc(db, 'about', 'content'));
    const about = aboutSnap.exists()
      ? ({ ...defaultPortfolioData.about, ...aboutSnap.data() } as AboutContent)
      : defaultPortfolioData.about;

    // 6. Fetch CV doc
    const cvSnap = await getDoc(doc(db, 'site_settings', 'cv'));
    const cv = cvSnap.exists() ? (cvSnap.data() as CVDoc) : defaultPortfolioData.cv;

    // 7. Fetch social links
    const socialSnap = await getDoc(doc(db, 'site_settings', 'social_links'));
    const socialLinks = socialSnap.exists()
      ? ((socialSnap.data()?.links as SocialLink[]) || defaultPortfolioData.socialLinks)
      : defaultPortfolioData.socialLinks;

    // 8. Fetch inquiries
    const inqSnap = await getDocs(collection(db, 'inquiries'));
    const inquiries: ContactMessage[] = [];
    inqSnap.forEach((d) => {
      inquiries.push({ ...d.data(), id: d.id } as ContactMessage);
    });
    inquiries.sort((a, b) => new Date(b.receivedAt || 0).getTime() - new Date(a.receivedAt || 0).getTime());

    return {
      settings,
      artworks: artworks,
      categories: categories.length > 0 ? categories : defaultPortfolioData.categories,
      exhibitions: exhibitions.length > 0 ? exhibitions : defaultPortfolioData.exhibitions,
      about,
      cv,
      socialLinks,
      inquiries,
      messages: inquiries
    };
  } catch (err) {
    console.warn('Firestore load warning:', err);
    return null;
  }
}

/**
 * Seed initial documents to Firestore when empty
 */
export async function seedInitialFirestoreData(data: PortfolioData): Promise<void> {
  try {
    const batch = writeBatch(db);

    // Settings
    batch.set(doc(db, 'site_settings', 'global'), data.settings || defaultSettings);

    // About
    batch.set(doc(db, 'about', 'content'), data.about || defaultPortfolioData.about);

    // CV
    if (data.cv) {
      batch.set(doc(db, 'site_settings', 'cv'), data.cv);
    }

    // Social
    batch.set(doc(db, 'site_settings', 'social_links'), { links: data.socialLinks || [] });

    await batch.commit();

    // Artworks (write individually or chunked)
    for (const art of data.artworks) {
      await setDoc(doc(db, 'artworks', art.id), art);
    }

    // Categories
    for (const cat of data.categories) {
      await setDoc(doc(db, 'categories', cat.id), cat);
    }

    // Exhibitions
    for (const exh of data.exhibitions) {
      await setDoc(doc(db, 'exhibitions', exh.id), exh);
    }
  } catch (err) {
    console.error('Error seeding Firestore data:', err);
  }
}

/**
 * Updates site settings in Firestore
 */
export async function saveFirestoreSettings(settings: Partial<SiteSettings>): Promise<void> {
  const cleanSettings = JSON.parse(JSON.stringify(settings));
  await setDoc(doc(db, 'site_settings', 'global'), cleanSettings, { merge: true });
}

/**
 * Saves or updates an artwork in Firestore
 */
export async function saveFirestoreArtwork(artwork: Artwork): Promise<void> {
  const cleanArtwork = JSON.parse(JSON.stringify(artwork));
  await setDoc(doc(db, 'artworks', artwork.id), cleanArtwork, { merge: true });
}

/**
 * Deletes an artwork from Firestore
 */
export async function deleteFirestoreArtwork(artworkId: string): Promise<void> {
  await deleteDoc(doc(db, 'artworks', artworkId));
}

/**
 * Saves or updates a category in Firestore
 */
export async function saveFirestoreCategory(category: Category): Promise<void> {
  const clean = JSON.parse(JSON.stringify(category));
  await setDoc(doc(db, 'categories', category.id), clean, { merge: true });
}

/**
 * Deletes a category from Firestore
 */
export async function deleteFirestoreCategory(categoryId: string): Promise<void> {
  await deleteDoc(doc(db, 'categories', categoryId));
}

/**
 * Saves or updates an exhibition in Firestore
 */
export async function saveFirestoreExhibition(exhibition: Exhibition): Promise<void> {
  const clean = JSON.parse(JSON.stringify(exhibition));
  await setDoc(doc(db, 'exhibitions', exhibition.id), clean, { merge: true });
}

/**
 * Deletes an exhibition from Firestore
 */
export async function deleteFirestoreExhibition(exhibitionId: string): Promise<void> {
  await deleteDoc(doc(db, 'exhibitions', exhibitionId));
}

/**
 * Saves about content in Firestore
 */
export async function saveFirestoreAbout(about: Partial<AboutContent>): Promise<void> {
  const clean = JSON.parse(JSON.stringify(about));
  await setDoc(doc(db, 'about', 'content'), clean, { merge: true });
}

/**
 * Saves CV in Firestore
 */
export async function saveFirestoreCV(cv: CVDoc | null): Promise<void> {
  if (cv) {
    const clean = JSON.parse(JSON.stringify(cv));
    await setDoc(doc(db, 'site_settings', 'cv'), clean);
  } else {
    await deleteDoc(doc(db, 'site_settings', 'cv'));
  }
}

/**
 * Saves social links in Firestore
 */
export async function saveFirestoreSocialLinks(links: SocialLink[]): Promise<void> {
  const clean = JSON.parse(JSON.stringify(links));
  await setDoc(doc(db, 'site_settings', 'social_links'), { links: clean });
}

/**
 * Saves an inquiry to Firestore
 */
export async function saveFirestoreInquiry(inquiry: ContactMessage): Promise<void> {
  const clean = JSON.parse(JSON.stringify(inquiry));
  await setDoc(doc(db, 'inquiries', inquiry.id), clean);
}

/**
 * Deletes an inquiry from Firestore
 */
export async function deleteFirestoreInquiry(inquiryId: string): Promise<void> {
  await deleteDoc(doc(db, 'inquiries', inquiryId));
}
