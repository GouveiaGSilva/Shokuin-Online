var tabela = document.getElementById("tabela");
const url = "/";
var dataIni = document.getElementById("dataIni");
var dataFim = document.getElementById("dataFim");
var tipo = document.getElementById("tipo");

window.addEventListener("DOMContentLoaded", async () => {

    await setDataAgora();

    dataIni.addEventListener("change", constroiTabela);
    dataFim.addEventListener("change", constroiTabela);
    tipo.addEventListener("change", constroiTabela);
});

async function gerarPDF() {
    const hoje = new Date();
    const nome = "Historico_movimentacoes_" + hoje.toLocaleDateString().replace(/\//g, '-') + ".pdf";
    const { jsPDF } = window.jspdf;

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    const corVermelho = [198, 40, 40];
    const corOuro = [212, 175, 55];
    const corCinzaEscuro = [51, 51, 51];
    const urlLogo = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_EW1pVi14HZShWF8KD4Uu3NALLJ7uBalzJA&s';

    function carregarImagem(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => resolve(img);
            img.onerror = (e) => reject(e);
            img.src = url;
        });
    }

    let imgElemento = null;
    try {
        imgElemento = await carregarImagem(urlLogo);
    } catch (e) {
        imgElemento = null;
    }

    function cabecalho() {
        if (imgElemento) {
            doc.addImage(imgElemento, 'JPEG', 14, 10, 15, 15);
        } else {
            doc.setDrawColor(corOuro[0], corOuro[1], corOuro[2]);
            doc.setLineWidth(0.5);
            doc.setFillColor(18, 18, 18);
            doc.circle(14 + 7.5, 10 + 7.5, 7.5, 'FD');
        }

        doc.setFont("Helvetica", "bold");
        doc.setFontSize(20);
        doc.setTextColor(corVermelho[0], corVermelho[1], corVermelho[2]);
        doc.text("DANTAI FÊNIX", 34, 17);

        doc.setFont("Helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(corCinzaEscuro[0], corCinzaEscuro[1], corCinzaEscuro[2]);
        doc.text("Histórico de Movimentações de Estoque", 34, 23);

        doc.setDrawColor(corOuro[0], corOuro[1], corOuro[2]);
        doc.setLineWidth(0.8);
        doc.line(14, 27, 283, 27);
    }

    const linhasHTML = document.querySelectorAll("#resultado tr");
    const dadosPorMes = {};

    linhasHTML.forEach(linha => {
        const colunas = linha.querySelectorAll("td");
        if (colunas.length < 6 || colunas[0].innerText.includes("Sem resultados"))
            return;

        const dataTexto = colunas[3].innerText.trim();
        const partesData = dataTexto.split(" ")[0].split("-");

        let nomeMes = "Geral";
        if (partesData.length >= 2) {
            const mesIndex = parseInt(partesData[1], 10) - 1;
            const meses = [
                "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
                "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
            ];
            nomeMes = meses[mesIndex] || "Geral";
            const ano = partesData[0].length === 4 ? partesData[0] : partesData[2];
            nomeMes += ` - ${ano}`;
        }

        if (!dadosPorMes[nomeMes]) {
            dadosPorMes[nomeMes] = [];
        }

        dadosPorMes[nomeMes].push([
            colunas[0].innerText,
            colunas[1].innerText,
            colunas[2].innerText,
            colunas[3].innerText,
            colunas[4].innerText,
            colunas[5].innerText
        ]);
    });

    if (Object.keys(dadosPorMes).length === 0) {
        cabecalho();
        doc.setFontSize(12);
        doc.text("Nenhum registro encontrado para emissão do relatório.", 14, 40);
        doc.save(nome);
        return;
    }

    let flag = true;
    let y = 32;

    cabecalho();

    const cabecalhosTabela = [["Instrumento", "Valor (R$)", "Qtd.", "Data e Hora", "Tipo", "Motivo"]];

    for (const mes in dadosPorMes) {
        if (!flag && y > 150) {
            doc.addPage();
            cabecalho();
            y = 32;
        }
        flag = false;

        doc.setFillColor(243, 241, 235);
        doc.rect(14, y, 269, 7, 'F');

        doc.setFont("Helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(corVermelho[0], corVermelho[1], corVermelho[2]);
        doc.text(`MOVIMENTAÇÕES DE ${mes.toUpperCase()}`, 17, y + 5);

        y += 9;

        doc.autoTable({
            head: cabecalhosTabela,
            body: dadosPorMes[mes],
            startY: y,
            margin: { left: 14, right: 14, top: 32 },
            pageBreak: 'auto',
            theme: 'striped',
            styles: {
                fontSize: 9,
                font: 'Helvetica',
                cellPadding: 3
            },
            headStyles: {
                fillColor: corVermelho,
                textColor: [255, 255, 255],
                fontStyle: 'bold'
            },
            alternateRowStyles: {
                fillColor: [253, 251, 247]
            },
            columnStyles: {
                0: { cellWidth: 50 },
                1: { cellWidth: 25 },
                2: { cellWidth: 15 },
                3: { cellWidth: 40 },
                4: { cellWidth: 30 },
                5: { cellWidth: 'auto' }
            },
            didDrawPage: function(data) {
                if (data.pageNumber > 1) {
                    cabecalho();
                }
            }
        });

        y = doc.autoTable.previous.finalY + 12;
    }

    const totalPaginas = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPaginas; i++) {
        doc.setPage(i);
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(`Página ${i} de ${totalPaginas}`, 297 / 2, 200, { align: 'center' });
        doc.text(`Gerado em: ${hoje.toLocaleString()}`, 14, 200);
    }

    doc.save(nome);
}

async function constroiTabela(){
    let str = "estoque/get-mov-filter?dataIni="+dataIni.value+"&dataFim="+dataFim.value+"&tipo="+tipo.value;
    const resp = await fetch(url + str);
    const tbody = document.getElementById("resultado");
    tbody.innerHTML = "";
    if(resp.ok){
        const dados = await resp.json();
        if(dados.length === 0){
            const tr = document.createElement("tr");
            tr.innerHTML = "<td colspan='6' style='text-align: center'>Sem resultados</td>"
            tbody.appendChild(tr);
            tabela.appendChild(tbody);
        }
        else {
            for (const obj of dados) {
                const tr = document.createElement("tr");
                var data = obj.data.substring(0, obj.data.indexOf('T'));
                var horario = obj.data.substring(obj.data.indexOf('T') + 1, obj.data.length - 9);
                tr.innerHTML = `
                <td>${obj.instrumento.instru_nome}</td>
                <td>${obj.valor}</td>
                <td>${obj.quant}</td>
                <td>${data + " " + horario}</td>
                <td>${obj.tipo}</td>
                <td>${obj.motivo}</td>
                </td>
            `;
                tbody.appendChild(tr);
                tabela.appendChild(tbody);
            }
        }
    }
    else{
        const tr = document.createElement("tr");
        tr.innerHTML = "<td colspan='6' style='text-align: center'>Sem resultados</td>"
        tbody.appendChild(tr);
        tabela.appendChild(tbody);
    }
}

async function setDataAgora(){
    const resp = await fetch(url+"estoque/get-mov-antigo");
    if(resp.ok) {
        let agora = new Date();
        let json = await resp.json();
        dataIni.value = json.data.substring(0, json.data.indexOf('T'));
        let mes = agora.getMonth() + 1;
        let dia = agora.getDate();
        if (dia % 10 === dia)
            dia = "0" + dia.toString();
        if (mes % 10 === mes)
            mes = "0" + mes.toString();
        let ano = agora.getFullYear();
        dataFim.value = ano + "-" + mes + "-" + dia;
    }
    await constroiTabela();
}