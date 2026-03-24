import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-[#0A1628] pt-16 pb-6 relative z-10">
      {/* Diagonal lines texture — footer only */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{
        backgroundImage: 'repeating-linear-gradient(45deg, #00BFFF 0px, #00BFFF 1px, transparent 1px, transparent 16px)',
        backgroundSize: '16px 16px',
      }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Col */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <Image src="/logo.webp" alt="Gradios" width={88} height={88} className="w-11 h-11 drop-shadow-md brightness-0 invert" />
              <span className="text-xl font-bold text-white font-display">Gradios</span>
            </div>
            <p className="text-sm font-medium text-secondary mb-3">Automação e Software Sob Medida</p>
            <p className="text-[#94A3B8] text-sm max-w-sm mb-6 leading-relaxed">
              Processos manuais consomem tempo e dinheiro.<br />Nós eliminamos os dois.
            </p>

            {/* +17 empresas seal */}
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-pill px-3 py-2 mb-6 inline-flex">
              <div className="flex -space-x-1.5">
                {["/logo-cliente-1.webp", "/logo-cliente-2.webp", "/logo-cliente-3.webp"].map((src, i) => (
                  <Image key={i} src={src} alt="" width={20} height={20} className="w-5 h-5 rounded-full border border-[#0A1628] object-cover bg-white" style={{ zIndex: 3 - i }} />
                ))}
              </div>
              <span className="text-xs text-[#94A3B8]"><span className="text-white font-semibold">+17</span> empresas atendidas</span>
            </div>

            {/* Micro-CTA WhatsApp */}
            <a
              href="https://wa.me/5543988372540"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/20 rounded-pill px-4 py-2.5 text-sm font-semibold text-[#25D366] transition-all duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2z" />
              </svg>
              Falar com um especialista
            </a>
          </div>

          {/* Soluções */}
          <div>
            <h3 className="font-bold text-white mb-4 font-display text-sm uppercase tracking-wider">Soluções</h3>
            <ul className="space-y-1 text-sm">
              <li><Link href="#solucoes" className="text-[#94A3B8] hover:text-white transition-colors block py-1.5">Automação de Processos</Link></li>
              <li><Link href="#solucoes" className="text-[#94A3B8] hover:text-white transition-colors block py-1.5">Desenvolvimento Sob Medida</Link></li>
              <li><Link href="#solucoes" className="text-[#94A3B8] hover:text-white transition-colors block py-1.5">Integrações e APIs</Link></li>
              <li><Link href="#solucoes" className="text-[#94A3B8] hover:text-white transition-colors block py-1.5">Dashboards e Relatórios</Link></li>
              <li><Link href="#solucoes" className="text-[#94A3B8] hover:text-white transition-colors block py-1.5">IA Aplicada ao Negócio</Link></li>
            </ul>
          </div>

          {/* Navegação */}
          <div>
            <h3 className="font-bold text-white mb-4 font-display text-sm uppercase tracking-wider">Navegação</h3>
            <ul className="space-y-1 text-sm">
              <li><Link href="#como-funciona" className="text-[#94A3B8] hover:text-white transition-colors block py-1.5">Como Funciona</Link></li>
              <li><Link href="#cases" className="text-[#94A3B8] hover:text-white transition-colors block py-1.5">Cases de Sucesso</Link></li>
              <li><Link href="/diagnostico" className="text-[#94A3B8] hover:text-white transition-colors block py-1.5">Diagnóstico Gratuito</Link></li>
              <li><Link href="/sobre" className="text-[#94A3B8] hover:text-white transition-colors block py-1.5">Sobre a Gradios</Link></li>
              <li><Link href="/respostas" className="text-[#94A3B8] hover:text-white transition-colors block py-1.5">Perguntas sobre Automação</Link></li>
              <li><Link href="#contato" className="text-[#94A3B8] hover:text-white transition-colors block py-1.5">Contato</Link></li>
            </ul>
          </div>

          {/* Contato + Legal */}
          <div>
            <h3 className="font-bold text-white mb-4 font-display text-sm uppercase tracking-wider">Contato</h3>
            <div className="flex flex-col gap-3 mb-6">
              <a href="mailto:contato@gradios.com.br" className="text-sm text-[#94A3B8] hover:text-white transition-colors flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                contato@gradios.com.br
              </a>
              <a href="https://wa.me/5543988372540" target="_blank" rel="noopener noreferrer" className="text-sm text-[#94A3B8] hover:text-green-400 transition-colors flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.325 0-4.47-.744-6.227-2.01l-.435-.327-2.646.887.887-2.646-.327-.435A9.956 9.956 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>
                (43) 98837-2540
              </a>
              <p className="text-xs text-[#94A3B8]/60 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                Londrina, PR | Brasil
              </p>
            </div>

            <h3 className="font-bold text-white mb-3 font-display text-sm uppercase tracking-wider">Legal</h3>
            <ul className="space-y-1 text-sm">
              <li><Link href="/termos" className="text-[#94A3B8] hover:text-white transition-colors block py-1.5">Termos de Uso</Link></li>
              <li><Link href="/privacidade" className="text-[#94A3B8] hover:text-white transition-colors block py-1.5">Política de Privacidade</Link></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#94A3B8]/40 text-center sm:text-left">
            &copy; {new Date().getFullYear()} Gradios Soluções em Tecnologia LTDA. Todos os direitos reservados.
          </p>
          <p className="text-xs text-[#94A3B8]/30 text-center sm:text-right">
            CNPJ: 65.663.208/0001-36
          </p>
        </div>
      </div>
    </footer>
  );
}
