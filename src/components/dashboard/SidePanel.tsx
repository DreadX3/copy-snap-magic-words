
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const SidePanel = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dicas de uso</CardTitle>
          <CardDescription>Como obter os melhores resultados</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4 text-sm">
            <li>
              <strong>Descrição da Imagem:</strong> Seja detalhado ao descrever o produto,
              incluindo características visuais importantes.
            </li>
            <li>
              <strong>Tema:</strong> Defina o contexto ou mensagem principal que deseja transmitir
              com seu copywriting.
            </li>
            <li>
              <strong>Tipo de Texto:</strong> Escolha com base no canal onde será usado:
              <ul className="ml-4 mt-2 space-y-2">
                <li>• Texto curto: ideal para Instagram, Twitter</li>
                <li>• Texto longo: melhor para Facebook, LinkedIn</li>
              </ul>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default SidePanel;
