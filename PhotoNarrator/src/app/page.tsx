import PhotoNarrator from '@/components/photo-narrator';

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <header className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary">
            Photo Narrator
          </h1>
          <p className="text-lg text-muted-foreground mt-2 font-body">
            Upload a photo and let our AI craft a beautiful description for you.
          </p>
        </header>
        <PhotoNarrator />
      </div>
    </main>
  );
}
