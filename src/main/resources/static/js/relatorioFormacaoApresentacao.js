async function converterImgParaBase64(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const dataURL = canvas.toDataURL('image/png');
            resolve(dataURL);
        };
        img.onerror = () => {
            reject(new Error("Erro ao carregar a imagem"));
        };
        img.src = url;
    });
}

async function gerarPDFFormacoesApre(id) {
    // Exibe um modal/aviso de carregamento (opcional, pode ser substituído por um spinner)
    const dropdown = document.getElementById("dropdown");
    if(dropdown) {
        dropdown.innerHTML = `<span class="dropdown-item text-muted small"><i class="bi bi-hourglass-split"></i> Gerando PDF...</span>`;
    }

    try {
        // 1. Buscar o nome da apresentação
        const respAp = await fetch("http://localhost:8080/apresentacao/get-byId?id="+id);
        let nomeApresentacao = "Apresentação";
        if (respAp.ok) {
            const dadosAp = await respAp.json();
            nomeApresentacao = dadosAp.nome;
        }

        // 2. Buscar o repertório da apresentação
        const respRep = await fetch("http://localhost:8080/apirepertorio/get?idApresentacao=" + id);
        if (!respRep.ok) {
            alert("Não foi possível carregar o repertório desta apresentação.");
            if(dropdown) dropdown.style.display = "none";
            return;
        }
        
        const repertorio = await respRep.json();
        const listaMusica = repertorio.listaMusica;
        const listaFormacao = repertorio.listaFormacao;

        if (!listaMusica || listaMusica.length === 0) {
            alert("Nenhuma música associada a esta apresentação.");
            if(dropdown) dropdown.style.display = "none";
            return;
        }

        // Inicializa o jsPDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        let yPos = 20;

        // Título principal
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.text(nomeApresentacao, pageWidth / 2, yPos, { align: "center" });
        yPos += 15;

        // Itera sobre as músicas
        for (let i = 0; i < listaMusica.length; i++) {
            const musica = listaMusica[i];
            const formacao = listaFormacao[i];

            // Título da Música
            doc.setFont("helvetica", "bold");
            doc.setFontSize(14);
            doc.text(`${i + 1}. ${musica.nome}`, 15, yPos);
            yPos += 8;

            if (formacao && formacao.forma_img) {
                try {
                    const imgUrl = `http://localhost:8080/uploads/formacoes/${formacao.forma_img}`;
                    const imgBase64 = await converterImgParaBase64(imgUrl);
                    
                    // Ajusta a imagem mantendo a proporção. Largura máx: pageWidth - 30
                    const imgProps = doc.getImageProperties(imgBase64);
                    const maxWidth = pageWidth - 30;
                    const scale = Math.min(maxWidth / imgProps.width, 1);
                    const drawWidth = imgProps.width * scale;
                    const drawHeight = imgProps.height * scale;

                    // Quebra de página se a imagem não couber
                    if (yPos + drawHeight > pageHeight - 15) {
                        doc.addPage();
                        yPos = 20;
                        doc.setFont("helvetica", "bold");
                        doc.setFontSize(14);
                        doc.text(`${i + 1}. ${musica.nome} (continuação)`, 15, yPos);
                        yPos += 8;
                    }

                    // Desenha centralizado
                    const xPos = (pageWidth - drawWidth) / 2;
                    doc.addImage(imgBase64, 'PNG', xPos, yPos, drawWidth, drawHeight);
                    yPos += drawHeight + 15;
                    
                } catch (imgError) {
                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(10);
                    doc.setTextColor(150, 0, 0);
                    doc.text("Erro ao carregar a imagem desta formação.", 15, yPos);
                    doc.setTextColor(0, 0, 0);
                    yPos += 15;
                }
            } else {
                doc.setFont("helvetica", "normal");
                doc.setFontSize(10);
                doc.setTextColor(100, 100, 100);
                doc.text("Nenhuma imagem cadastrada para esta formação.", 15, yPos);
                doc.setTextColor(0, 0, 0);
                yPos += 15;
            }

            // Quebra de página preventiva se estivermos muito no fim
            if (yPos > pageHeight - 30 && i < listaMusica.length - 1) {
                doc.addPage();
                yPos = 20;
            }
        }

        // Salvar PDF
        doc.save(`Formacoes_Apresentacao_${nomeApresentacao}.pdf`);
        
        if(dropdown) {
            dropdown.style.display = "none";
        }

    } catch (error) {
        console.error("Erro ao gerar PDF:", error);
        alert("Ocorreu um erro ao gerar o PDF.");
        if(dropdown) {
            dropdown.style.display = "none";
        }
    }
}
