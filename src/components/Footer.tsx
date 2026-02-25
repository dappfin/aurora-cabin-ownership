const Footer = () => (
  <footer className="py-12 px-6 border-t border-border">
    <div className="container mx-auto max-w-4xl flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="aurora-text font-serif text-xl font-bold">Aurora Vault</div>
      <p className="text-sm text-muted-foreground text-center">
        © {new Date().getFullYear()} Aurora Vault. Secure Arctic Assets, Transparent Revenue.
      </p>
      <div className="flex gap-6 text-sm text-muted-foreground">
        <a href="#" className="hover:text-foreground transition-colors">Docs</a>
        <a href="#" className="hover:text-foreground transition-colors">Community</a>
        <a href="#" className="hover:text-foreground transition-colors">Contact</a>
      </div>
    </div>
  </footer>
);

export default Footer;
