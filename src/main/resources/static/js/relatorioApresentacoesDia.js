// Variável para armazenar a busca atual e usar no PDF
let agendasAtuais = [];
let buscaIni = "";
let buscaFim = "";

function formatarDataBrasileira(dataISO) {
    const partes = dataISO.split("-");
    if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return dataISO;
}

function formatarEnderecoCompleto(localObj) {
    if (!localObj) return "Local desconhecido";
    let endereco = `${localObj.rua}, ${localObj.numero}`;
    if (localObj.complemento) endereco += ` - ${localObj.complemento}`;
    endereco += `\n${localObj.bairro}, ${localObj.cidade} - ${localObj.estado} (CEP: ${localObj.CEP})`;
    return endereco;
}

async function buscarAgendasPorPeriodo() {
    const dataIni = document.getElementById("dataIni").value;
    const dataFim = document.getElementById("dataFim").value;

    if (!dataIni || !dataFim) {
        mostrarModal("Atenção", "Por favor, preencha ambas as datas do período.", "bi-exclamation-triangle-fill", "text-warning");
        return null;
    }

    if (new Date(dataIni) > new Date(dataFim)) {
        mostrarModal("Atenção", "A data inicial não pode ser maior que a data final.", "bi-exclamation-triangle-fill", "text-warning");
        return null;
    }

    try {
        const response = await fetch(`/apiagenda/getagendaporperiodo?inicio=${dataIni}&fim=${dataFim}`);
        
        if (!response.ok) {
            return [];
        }

        const data = await response.json();
        
        // Atualiza as variáveis globais para o PDF
        agendasAtuais = data;
        buscaIni = formatarDataBrasileira(dataIni);
        buscaFim = formatarDataBrasileira(dataFim);

        return data;

    } catch (error) {
        console.error("Erro ao buscar agendas:", error);
        mostrarModal("Erro", "Erro ao conectar com o servidor.", "bi-x-circle-fill", "text-danger");
        return null;
    }
}

async function carregarTabelaApresentacoes() {
    const tbody = document.getElementById("resultadoApresentacoes");
    tbody.innerHTML = `<tr><td colspan="4" class="text-center p-4"><div class="spinner-border text-danger" role="status"></div></td></tr>`;
    
    const agendas = await buscarAgendasPorPeriodo();
    
    if (!agendas) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted p-4">Erro na busca.</td></tr>`;
        return;
    }

    if (agendas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted p-4">Nenhuma apresentação agendada para este período.</td></tr>`;
        return;
    }

    let html = "";
    agendas.forEach(agenda => {
        const local = agenda.local;
        html += `
            <tr>
                <td class="fw-bold text-dark">${formatarDataBrasileira(agenda.Data || "")}</td>
                <td class="text-danger fw-bold"><i class="bi bi-clock me-1"></i> ${agenda.Horario}</td>
                <td class="fw-semibold text-dark">${agenda.localidade || "Desconhecida"}</td>
                <td class="text-muted small" style="white-space: pre-line;">${formatarEnderecoCompleto(local)}</td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

async function baixarRelatorioApresentacoesPDF() {
    // Se a tabela não foi gerada ainda ou se os inputs mudaram, faz a busca
    const dataIniAtual = document.getElementById("dataIni").value;
    const dataFimAtual = document.getElementById("dataFim").value;

    if (!dataIniAtual || !dataFimAtual) {
        mostrarModal("Atenção", "Preencha as datas antes de gerar o PDF.", "bi-exclamation-triangle-fill", "text-warning");
        return;
    }

    let dados = agendasAtuais;
    let lblIni = buscaIni;
    let lblFim = buscaFim;

    // Se os inputs mudaram em relação à última busca, busca de novo
    if (lblIni !== formatarDataBrasileira(dataIniAtual) || lblFim !== formatarDataBrasileira(dataFimAtual) || agendasAtuais.length === 0) {
        dados = await buscarAgendasPorPeriodo();
        if (!dados) return; // Erro já tratado no buscarAgendasPorPeriodo
        lblIni = formatarDataBrasileira(dataIniAtual);
        lblFim = formatarDataBrasileira(dataFimAtual);
        
        // Também já atualiza a tabela pro usuário
        carregarTabelaApresentacoes();
    }

    if (dados.length === 0) {
        mostrarModal("Aviso", "Nenhuma apresentação encontrada para este período.", "bi-info-circle", "text-info");
        return;
    }

    gerarPDFLinhaDoTempo(dados, lblIni, lblFim);
}

function gerarPDFLinhaDoTempo(agendas, dataIniFormatada, dataFimFormatada) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Configurações do Cabeçalho
    const redColor = [220, 38, 38]; // var(--taiko-red)
    const goldColor = [217, 160, 91]; // var(--taiko-gold)

    // Título principal
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(20, 20, 20);
    doc.text("ShokuinTaiko - Relatório de Apresentações", 14, 22);

    // Subtítulo (Período)
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(redColor[0], redColor[1], redColor[2]);
    let subtitulo = `Período: ${dataIniFormatada} a ${dataFimFormatada}`;
    if (dataIniFormatada === dataFimFormatada) {
        subtitulo = `Data: ${dataIniFormatada}`;
    }
    doc.text(subtitulo, 14, 30);

    // Linha divisória
    doc.setDrawColor(goldColor[0], goldColor[1], goldColor[2]);
    doc.setLineWidth(0.5);
    doc.line(14, 34, 196, 34);

    // Preparar dados para o AutoTable
    const tableColumn = ["Data", "Horário", "Apresentação", "Local (Endereço)"];
    const tableRows = [];

    agendas.forEach(agenda => {
        const rowData = [
            formatarDataBrasileira(agenda.Data || ""),
            agenda.Horario,
            agenda.localidade || "Desconhecida",
            formatarEnderecoCompleto(agenda.local).replace(/\n/g, ' ') // Substitui quebra de linha por espaço no PDF se preferir, ou mantem. O autotable lida bem com \n
        ];
        tableRows.push(rowData);
    });

    // Usando AutoTable do jsPDF
    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 40,
        theme: 'grid',
        headStyles: {
            fillColor: redColor,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center'
        },
        columnStyles: {
            0: { cellWidth: 25, halign: 'center', fontStyle: 'bold' },
            1: { cellWidth: 20, halign: 'center' },
            2: { cellWidth: 40, halign: 'center' },
            3: { cellWidth: 'auto' } // Endereço ocupa o restante
        },
        styles: {
            fontSize: 9,
            cellPadding: 4,
            valign: 'middle'
        },
        alternateRowStyles: {
            fillColor: [250, 250, 250]
        },
        margin: { top: 40 }
    });

    // Rodapé
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        const footerText = `ShokuinTaiko Sistema de Gestão - Gerado em ${new Date().toLocaleDateString('pt-BR')} - Página ${i} de ${pageCount}`;
        doc.text(footerText, 14, doc.internal.pageSize.getHeight() - 10);
    }

    // Baixar o arquivo
    const nomeArquivo = `Relatorio_Apresentacoes_${dataIniFormatada.replace(/\//g,'-')}_a_${dataFimFormatada.replace(/\//g,'-')}.pdf`;
    doc.save(nomeArquivo);
}

function mostrarModal(titulo, mensagem, iconeClass = "bi-info-circle", iconeCor = "text-taiko-red") {
    const modalElement = document.getElementById('modalMsg');
    if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        document.getElementById("subtitulo").innerText = titulo;
        document.getElementById("msg").innerText = mensagem;
        
        const icone = document.getElementById("iconeModal");
        if (icone) {
            icone.className = `bi fs-5 ${iconeClass}`;
        }
        
        const divIcone = icone.parentElement;
        if (divIcone) {
            divIcone.className = `bg-light text-white p-2 rounded-circle d-flex align-items-center justify-content-center shadow-sm ${iconeCor}`;
        }
        
        modal.show();
    } else {
        alert(`${titulo}: ${mensagem}`);
    }
}
