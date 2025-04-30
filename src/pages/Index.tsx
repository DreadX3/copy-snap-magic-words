import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowRight, MessageSquare, Upload, Share2, LineChart } from "lucide-react";
const Index = () => {
  return <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero section */}
        <section className="bg-gradient-to-b from-white to-gray-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Transforme imagens em </span>{" "}
                  <span className="block gradient-text xl:inline">copywriting poderoso</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto lg:mx-0">
                  CopySnap AI gera automaticamente textos persuasivos para seus produtos a partir de uma única imagem. Ideal para e-commerce, influenciadores e vendedores.
                </p>
                <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                  <Link to="/register">
                    <Button size="lg" className="px-8 py-6 text-lg">
                      Comece Grátis <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
                <div className="relative mx-auto w-full rounded-lg shadow-lg lg:max-w-md">
                  <div className="relative block w-full bg-white rounded-lg overflow-hidden">
                    <img className="w-full" src="https://plus.unsplash.com/premium_photo-1682125177822-63c27a3830ea?q=80&w=2187&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2787&q=80" alt="CopySnap AI Demo" />
                    <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                      <div className="bg-white bg-opacity-85 backdrop-blur-sm p-6 rounded-lg shadow-xl max-w-xs">
                        <h3 className="text-lg font-bold mb-2">✨ Perfeito para o seu feed!</h3>
                        <p className="text-sm text-gray-700">Tênis confortáveis e estilosos para o seu dia a dia! Disponíveis em várias cores. 👟 #ModaVerao #Conforto</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Como o CopySnap AI funciona
              </h2>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">Textos de vendas criados automaticamente pela IA, prontos para converter posts em lucro!</p>
            </div>

            <div className="mt-16">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {/* Feature 1 */}
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-brand-100 text-brand-600 mb-4">
                    <Upload className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Envie sua imagem</h3>
                  <p className="mt-2 text-base text-gray-500 text-center">
                    Faça upload da foto do seu produto que deseja vender.
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-brand-100 text-brand-600 mb-4">
                    <MessageSquare className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Obtenha textos persuasivos</h3>
                  <p className="mt-2 text-base text-gray-500 text-center">
                    Nossa IA gera 3 opções de textos personalizados para seu público.
                  </p>
                </div>

                {/* Feature 3 */}
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-brand-100 text-brand-600 mb-4">
                    <Share2 className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Compartilhe nas redes</h3>
                  <p className="mt-2 text-base text-gray-500 text-center">
                    Escolha a melhor opção e compartilhe diretamente nas suas redes sociais.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Planos simples e acessíveis
              </h2>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
                Escolha o plano ideal para o seu negócio
              </p>
            </div>

            <div className="mt-16 grid gap-8 lg:grid-cols-2 lg:max-w-4xl lg:mx-auto">
              {/* Free plan */}
              <div className="border border-gray-200 rounded-lg shadow-sm bg-white p-8">
                <h3 className="text-xl font-semibold text-gray-900">Gratuito</h3>
                <p className="mt-4 text-gray-500">Ideal para iniciantes</p>
                <p className="mt-8">
                  <span className="text-4xl font-extrabold text-gray-900">R$0</span>
                  <span className="text-base font-medium text-gray-500">/mês</span>
                </p>
                <ul className="mt-8 space-y-4">
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">3 gerações por dia</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">Histórico de 10 mensagens</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">Compartilhamento básico</p>
                  </li>
                </ul>
                <div className="mt-8">
                  <Link to="/register">
                    <Button variant="outline" className="w-full">Começar grátis</Button>
                  </Link>
                </div>
              </div>

              {/* Pro plan */}
              <div className="border-2 border-brand-500 rounded-lg shadow-sm bg-white p-8 relative">
                <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 bg-brand-500 text-white py-1 px-4 rounded-full text-sm font-medium">
                  Popular
                </div>
                <h3 className="text-xl font-semibold text-gray-900">PRO</h3>
                <p className="mt-4 text-gray-500">Para quem precisa de mais</p>
                <p className="mt-8">
                  <span className="text-4xl font-extrabold text-gray-900">R$29</span>
                  <span className="text-base font-medium text-gray-500">/mês</span>
                </p>
                <ul className="mt-8 space-y-4">
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700"><strong>Gerações ilimitadas</strong></p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">Histórico completo</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">Compartilhamento direto em todas as redes</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">Hashtags personalizadas</p>
                  </li>
                </ul>
                <div className="mt-8">
                  <Link to="/register">
                    <Button className="w-full">Assinar PRO</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA section */}
        <section className="bg-brand-600">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              <span className="block">Pronto para impulsionar suas vendas?</span>
              <span className="block text-brand-200">Comece a usar o CopySnap AI hoje.</span>
            </h2>
            <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
              <div className="inline-flex rounded-md shadow">
                <Link to="/register">
                  <Button variant="secondary" size="lg" className="px-8">
                    Começar agora
                  </Button>
                </Link>
              </div>
              <div className="ml-3 inline-flex rounded-md shadow">
                <Link to="/login">
                  <Button variant="outline" size="lg" className="px-8 bg-brand-700 text-white hover:bg-brand-800 border-brand-800">
                    Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>;
};
export default Index;