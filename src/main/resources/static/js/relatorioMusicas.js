function baixarRelatorioPdf(flag) {
    const dataInicio = document.getElementById('dataInicio').value;
    const dataFim = document.getElementById('dataFim').value;
    var myModal = new bootstrap.Modal(document.getElementById('modalMsg'));

    if(!dataInicio || !dataFim) {
        document.getElementById('msg').innerText = "Por favor, selecione ambas as datas para gerar o relatório.";
        myModal.show();
        return;
    }
    document.getElementById('msg').innerText = "Relatório sendo gerado. O download começará em breve!";
    myModal.show();
    const params = new URLSearchParams();
    params.append('dataInicio',dataInicio);
    params.append('dataFim',dataFim);
    let listaRelatorio = [];
    if(flag) {
        fetch(`http://localhost:8080/apirelmusica/listamusicas/maistocadas/pordata?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        })
            .then(response => response.json())
            .then(data => {
                listaRelatorio = data;
                console.log(listaRelatorio);
                if (listaRelatorio.length > 0)
                    gerarPDF(listaRelatorio, dataInicio, dataFim);
                else {
                    window.location.reload();
                    document.getElementById('msg').innerText = "Periodo de tempo selecionado sem apresentações\n" +
                        "Por favor, selecione outro periodo de tempo";
                    myModal.show();
                }
            })
            .catch(error => {
                console.log(error);
                window.location.reload();
                document.getElementById('msg').innerText = "Periodo de tempo selecionado sem apresentações\n" +
                    "Por favor, selecione outro periodo de tempo";
                myModal.show();
            })
    }else{
        fetch(`http://localhost:8080/apirelmusica/listamusicas/10maistocadas/pordata?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        })
            .then(response => response.json())
            .then(data => {
                listaRelatorio = data;
                console.log(listaRelatorio);
                if (listaRelatorio.length > 0)
                    gerarPDF(listaRelatorio, dataInicio, dataFim);
                else {
                    window.location.reload();
                    document.getElementById('msg').innerText = "Periodo de tempo selecionado sem apresentações\n" +
                        "Por favor, selecione outro periodo de tempo";
                    myModal.show();
                }
            })
            .catch(error => {
                console.log(error);
                window.location.reload();
                document.getElementById('msg').innerText = "Periodo de tempo selecionado sem apresentações\n" +
                    "Por favor, selecione outro periodo de tempo";
                myModal.show();
            })
    }
}

function desenharEixoSuperior(doc, yPos, baseX, maxLarguraBarra, corEscura, porcentagensUnicas) {
    doc.setLineWidth(0.4);
    doc.setDrawColor(...corEscura);
    doc.line(baseX, yPos, baseX + maxLarguraBarra, yPos);

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...corEscura);

    porcentagensUnicas.forEach(p => {
        const posX = baseX + (p / 100) * maxLarguraBarra;
        const texto = `${p}%`;
        const textWidth = doc.getTextWidth(texto);
        doc.text(texto, posX - (textWidth / 2), yPos - 2);
    });
    doc.setTextColor(0, 0, 0);
}

function desenharGradesPontilhadas(doc, yInicio, yFim, baseX, maxLarguraBarra, porcentagensUnicas) {
    doc.setLineDashPattern([1, 1.5], 0);
    doc.setLineWidth(0.2);
    doc.setDrawColor(200, 200, 200);

    porcentagensUnicas.forEach(p => {
        const posX = baseX + (p / 100) * maxLarguraBarra;
        doc.line(posX, yInicio, posX, yFim);
    });

    doc.setLineDashPattern([], 0);
}

function desenharCoroa(doc, x, y, corDourado) {
    doc.setFillColor(...corDourado);
    doc.rect(x, y, 10, 2, 'F');
    doc.triangle(x, y, x + 3, y, x - 1, y - 6, 'F');
    doc.triangle(x + 2, y, x + 8, y, x + 5, y - 8, 'F');
    doc.triangle(x + 7, y, x + 10, y, x + 11, y - 6, 'F');
}

function desenharRelogio(doc, x, y, corDourado) {
    doc.setFillColor(...corDourado);
    doc.circle(x + 4, y, 5, 'F');

    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.8);
    doc.line(x + 4, y, x + 4, y - 2.5);
    doc.line(x + 4, y, x + 6, y + 1.5);
}

// ==========================================
// FUNÇÃO PRINCIPAL
// ==========================================
function gerarPDF(listaRelatorio, dataInicio, dataFim) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const corVermelho = [190, 30, 45];
    const corDourado = [212, 175, 55];
    const corEscura = [55, 65, 81];

    doc.setTextColor(...corEscura);
    doc.setFontSize(18);
    doc.text("SHOKUIN", 14, 21);

    doc.setTextColor(...corDourado);
    doc.setFontSize(9);
    doc.text("DANTAI FÊNIX", 14, 26);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Relatório de Músicas Mais Tocadas", 14, 40);

    let dataFormatadaInicio = dataInicio;
    let dataFormatadaFim = dataFim;
    let partes = dataInicio.split("-");
    dataFormatadaInicio = `${partes[2]}/${partes[1]}/${partes[0]}`;
    partes = dataFim.split("-");
    dataFormatadaFim = `${partes[2]}/${partes[1]}/${partes[0]}`;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(`Período: ${dataFormatadaInicio} a ${dataFormatadaFim}`, 14, 46);

    let totalSegundosGeral = 0;
    const showsUnicos = new Set();

    const campeao = listaRelatorio[0];

    listaRelatorio.forEach(item => {
        const execucoes = item.totalExecucoes;

        item.agendas.forEach(a => showsUnicos.add(a.id));


        const tempoStr = item.musica.compositor;
        const partesTempo = tempoStr.split(":");
        let segundosDaMusica = 0;

        if (partesTempo.length === 3) {
            segundosDaMusica = (+partesTempo[0] * 3600) + (+partesTempo[1] * 60) + (+partesTempo[2]);
        }

        totalSegundosGeral += (segundosDaMusica * execucoes);
    });

    const qtdShows = showsUnicos.size > 0 ? showsUnicos.size : 1;
    const mediaSegundosPorShow = totalSegundosGeral / qtdShows;

    const mediaMinutos = Math.floor(mediaSegundosPorShow / 60);
    const mediaRestoSegundos = Math.floor(mediaSegundosPorShow % 60);
    const textoMediaTempo = `${mediaMinutos} min e ${mediaRestoSegundos} seg`;


    if (campeao) {
        doc.setDrawColor(...corDourado);
        doc.setFillColor(253, 245, 245);
        doc.roundedRect(14, 52, 182, 22, 2, 2, 'FD');

        desenharCoroa(doc, 18, 68, corDourado);

        doc.setFontSize(8);
        doc.setTextColor(...corEscura);
        doc.text("MÚSICA CAMPEÃ", 32, 58);

        doc.setFontSize(14);
        doc.setTextColor(...corVermelho);
        let nomeCamp = campeao.musica.nome;
        if(nomeCamp.length > 40) nomeCamp = nomeCamp.substring(0, 38) + "...";
        doc.text(nomeCamp, 32, 65);

        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        const execCamp = campeao.agendas ? campeao.agendas.length : campeao.totalExecucoes;
        doc.text(`${execCamp} execuções no período`, 32, 70);
    }


    const tableColumns = ["Posição", "Música", "Autor", "Total de Execuções", "Formação Mais Usada"];
    const tableRows = [];

    listaRelatorio.forEach((item, index) => {
        let formacaoMaisUsada = "Nenhuma";
        const contagemFormacoes = {};

        item.formacoes.forEach(f => {
            const nomeForma = f.forma_nome;
            contagemFormacoes[nomeForma] = (contagemFormacoes[nomeForma] || 0) + 1;
        });

        let maxAparicoes = 0;
        for (const nome in contagemFormacoes) {
            if (contagemFormacoes[nome] > maxAparicoes) {
                maxAparicoes = contagemFormacoes[nome];
                formacaoMaisUsada = nome;
            }
        }

        tableRows.push([
            index + 1,
            item.musica.nome,
            item.musica.duracao,
            item.totalExecucoes,
            formacaoMaisUsada
        ]);
    });

    doc.autoTable({
        head: [tableColumns],
        body: tableRows,
        startY: 82,
        theme: 'striped',
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: corVermelho, textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [253, 245, 245] }
    });


    let finalY = doc.lastAutoTable.finalY + 20;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Participação das Músicas no Total", 14, finalY);
    finalY += 15;

    let totalGeral = 0;
    listaRelatorio.forEach(item => {
        totalGeral += item.totalExecucoes;
    });
    if (totalGeral === 0) totalGeral = 1;

    const baseX = 55;
    const maxLarguraBarra = 140;

    const porcentagensUnicas = new Set();
    listaRelatorio.forEach(item => {
        const p = ((item.totalExecucoes || 0) / totalGeral) * 100;
        porcentagensUnicas.add(Math.round(p));
    });
    porcentagensUnicas.add(100);
    porcentagensUnicas.add(0);

    let eixoY = finalY;

    desenharEixoSuperior(doc, eixoY, baseX, maxLarguraBarra, corEscura, porcentagensUnicas);
    finalY += 5;

    listaRelatorio.forEach((item) => {
        if (finalY > 270) {
            desenharGradesPontilhadas(doc, eixoY, finalY + 2, baseX, maxLarguraBarra, porcentagensUnicas);
            doc.addPage();
            finalY = 20;
            eixoY = finalY;
            desenharEixoSuperior(doc, eixoY, baseX, maxLarguraBarra, corEscura, porcentagensUnicas);
            finalY += 5;
        }

        const execucoes = item.totalExecucoes;
        const porcentagem = (execucoes / totalGeral) * 100;
        const larguraAtual = (porcentagem / 100) * maxLarguraBarra;

        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");

        let nomeMusica = item.musica.nome;
        if (nomeMusica.length > 18) {
            nomeMusica = nomeMusica.substring(0, 16) + "...";
        }
        doc.text(nomeMusica, 14, finalY + 4);

        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 100, 100);
        doc.text(`(${execucoes} vezes)`, 14, finalY + 8);
        doc.setTextColor(0, 0, 0);

        doc.setFillColor(240, 240, 240);
        doc.rect(baseX, finalY, maxLarguraBarra, 6, 'F');

        doc.setFillColor(...corVermelho);
        doc.rect(baseX, finalY, larguraAtual, 6, 'F');

        finalY += 12;
    });

    desenharGradesPontilhadas(doc, eixoY, finalY, baseX, maxLarguraBarra, porcentagensUnicas);


    doc.addPage();
    let yHistorico = 20;

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Detalhamento de Apresentações por Música", 14, yHistorico);
    yHistorico += 10;

    const histColumns = ["Música", "Formação" ,"Data", "Hora", "Apresentação"];
    const histRows = [];

    listaRelatorio.forEach(item => {
        const nomeMusica = item.musica.nome;

        const qtdAgendas = item.agendas.length;
        const qtdApres =  item.apresentacoes.length;
        const qtdFormacoes = item.formacoes.length;
        const totalRegistros = Math.max(qtdAgendas, qtdApres, qtdFormacoes);

        if (totalRegistros === 0) {
            histRows.push([nomeMusica, "-", "-", "-", "Nenhum registro"]);
        } else {
            for (let i = 0; i < totalRegistros; i++) {

                let formacaoNome = item.formacoes[i].forma_nome;
                let dataFormatada = "-";
                let horarioFormatado = "-";

                const partes = item.agendas[i].Data.split("-");
                dataFormatada = `${partes[2]}/${partes[1]}/${partes[0]}`;

                const partesHora = item.agendas[i].Horario.split(":");
                horarioFormatado = `${partesHora[0]}:${partesHora[1]}`;
                let localNome = item.apresentacoes[i].nome;

                histRows.push([nomeMusica, formacaoNome, dataFormatada, horarioFormatado, localNome]);
            }
        }
    });

    doc.autoTable({
        head: [histColumns],
        body: histRows,
        startY: yHistorico, // Tabela inicia perfeitamente após o card
        theme: 'striped',
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: corVermelho, textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [253, 245, 245] }
    });

    // ==========================================
    // 4. TEMPO TOTAL POR APRESENTAÇÃO
    // ==========================================
    doc.addPage();
    let yTempos = 20;

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Tempo Total por Apresentação (Estimativa de Duração)", 14, yTempos);
    yTempos += 10;

    doc.setDrawColor(...corDourado);
    doc.setFillColor(253, 245, 245);
    doc.roundedRect(14, yTempos, 182, 22, 2, 2, 'FD');

    desenharRelogio(doc, 18, yTempos + 11, corDourado);

    doc.setFontSize(8);
    doc.setTextColor(...corEscura);
    doc.text("MÉDIA DE TEMPO POR SHOW", 32, yTempos + 6);

    doc.setFontSize(14);
    doc.setTextColor(...corDourado);
    doc.text(textoMediaTempo, 32, yTempos + 13);

    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Baseado em ${showsUnicos.size} apresentações`, 32, yTempos + 18);


    yTempos += 32;

    // Lógica para agrupar o tempo total de cada apresentação (local)
    const tempoPorApresentacao = {};

    listaRelatorio.forEach(item => {
        const qtdApres = (item.apresentacoes && item.apresentacoes.length) || 0;
        const qtdAgendas = (item.agendas && item.agendas.length) || 0;
        const maxIdx = Math.max(qtdApres, qtdAgendas);

        const tempoStr = item.musica.compositor || "00:00:00";
        const partesTempo = tempoStr.split(":");
        let segundosDaMusica = 0;
        if (partesTempo.length === 3) {
            segundosDaMusica = (+partesTempo[0] * 3600) + (+partesTempo[1] * 60) + (+partesTempo[2]);
        }

        for(let i = 0; i < maxIdx; i++){
            let nomeApres = "Apresentação Não Nomeada";
            if(item.apresentacoes && item.apresentacoes[i] && item.apresentacoes[i].nome) {
                nomeApres = item.apresentacoes[i].nome;
            }

            if(!tempoPorApresentacao[nomeApres]) {
                tempoPorApresentacao[nomeApres] = 0;
            }
            // Soma o tempo da música na apresentação específica
            tempoPorApresentacao[nomeApres] += segundosDaMusica;
        }
    });

    const rowsTempos = [];

    // Converte os segundos de cada evento para o formato HH:MM:SS ou Minutos
    for(let nomeApres in tempoPorApresentacao) {
        const totalSegs = tempoPorApresentacao[nomeApres];
        const horas = Math.floor(totalSegs / 3600);
        const minutos = Math.floor((totalSegs % 3600) / 60);
        const segundos = totalSegs % 60;

        let tempoFormatado = "";
        if (horas > 0) {
            tempoFormatado = `${horas}h ${minutos}m ${segundos}s`;
        } else {
            tempoFormatado = `${minutos} min e ${segundos} seg`;
        }

        rowsTempos.push([nomeApres, tempoFormatado]);
    }

    // Ordena do evento mais longo para o mais curto
    rowsTempos.sort((a, b) => {
        const segsA = tempoPorApresentacao[a[0]];
        const segsB = tempoPorApresentacao[b[0]];
        return segsB - segsA;
    });

    if (rowsTempos.length === 0) {
        rowsTempos.push(["Nenhum registro encontrado", "-"]);
    }

    doc.autoTable({
        head: [["Apresentação / Local", "Duração Total (Soma das Músicas)"]],
        body: rowsTempos,
        startY: yTempos,
        theme: 'striped',
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: corEscura, textColor: [255, 255, 255] }, // Usei a cor escura (cinza do Shokuin) pra contrastar com a tabela anterior
        alternateRowStyles: { fillColor: [245, 247, 250] }
    });

    doc.save(`Relatorio_${dataFormatadaInicio}_a_${dataFormatadaFim}.pdf`);
}