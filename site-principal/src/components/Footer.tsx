import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-white pt-16 pb-8 border-t border-card-border relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Col */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
               <Image src="/logo.png" alt="Gradios" width={88} height={88} className="w-11 h-11 drop-shadow-md" />
              <span className="font-bold text-[22px] tracking-tight text-text">Gradios</span>
            </div>
            <p className="text-sm font-medium text-primary mb-2">O cérebro da sua empresa.</p>
            <p className="text-text-muted text-sm max-w-sm mb-6">
              Menos processo manual. Mais escala.<br />Software que resolve de verdade.
            </p>
            <div className="flex flex-col gap-1 mb-4">
              <a href="mailto:contato@bgtechsolucoes.com.br" className="text-sm font-medium text-primary hover:underline">
                contato@bgtechsolucoes.com.br
              </a>
              <a href="https://wa.me/5543988372540" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-green-600 hover:underline">
                (43) 98837-2540
              </a>
            </div>
            <p className="text-xs text-text-muted/60 mb-4">Londrina, PR | Brasil</p>

            {/* Redes Sociais */}
            <div className="flex items-center gap-3">
              <a
                href="https://www.instagram.com/bgtechsolucoes"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram da Gradios"
                className="w-9 h-9 rounded-lg bg-primary/8 hover:bg-brand-gradient flex items-center justify-center text-primary hover:text-white transition-all duration-300 group"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/company/bgtechsolucoes"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn da Gradios"
                className="w-9 h-9 rounded-lg bg-primary/8 hover:bg-brand-gradient flex items-center justify-center text-primary hover:text-white transition-all duration-300 group"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
            </div>
          </div>

          {/* Links Col 1 */}
          <div>
            <h3 className="font-bold text-text mb-4">Navegação</h3>
            <ul className="space-y-1 text-sm">
              <li><Link href="#solucoes" className="text-text-muted hover:text-text transition-colors block py-2">Soluções</Link></li>
              <li><Link href="#como-funciona" className="text-text-muted hover:text-text transition-colors block py-2">Como Funciona</Link></li>
              <li><Link href="#cases" className="text-text-muted hover:text-text transition-colors block py-2">Cases de Sucesso</Link></li>
              <li><Link href="#contato" className="text-text-muted hover:text-text transition-colors block py-2">Contato</Link></li>
            </ul>
          </div>

          {/* Links Col 2 */}
          <div>
            <h3 className="font-bold text-text mb-4">Legal</h3>
            <ul className="space-y-1 text-sm">
              <li><Link href="/termos" className="text-text-muted hover:text-text transition-colors block py-2">Termos de Uso</Link></li>
              <li><Link href="/privacidade" className="text-text-muted hover:text-text transition-colors block py-2">Política de Privacidade</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-card-border/60">
          <p className="text-xs text-text-muted/50 text-center">
            © 2026 Gradios Soluções em Tecnologia LTDA | CNPJ 65.663.208/0001-36 | Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
