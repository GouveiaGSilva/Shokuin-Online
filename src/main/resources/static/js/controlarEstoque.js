var form = document.getElementById("formEstoque");
var subtitulo = document.getElementById("subtitulo");
var selecionada = 'e';
var inputSelecionado = null;

const url = "/";
var vet = [];
const modal = new bootstrap.Modal(document.getElementById('modalMsg'));
var msg = document.getElementById("msg");
var subitutlo = document.getElementById("modalSubtitulo");
var titulo = document.getElementById("titulo");


exibirEntrada();

async function registrarEntrada(e){
    e.preventDefault();
    if(validaDados()) {
        const hora = document.getElementById("horario").value + ":00";
        const data = document.getElementById("data").value;
        const dataEntrada = data + "T" + hora + "-03:00";
        const estoque = {
            id: 0,
            instrumento: {
                instru_id: Number(document.getElementById("codigo").value),
                instru_nome: document.getElementById("nome").value,
                fornecedor: {
                    id: Number(document.getElementById("fornecedor").value)
                }
            },
            quantidade: Number(document.getElementById("quant").value)
        }
        const mov = {
            id: Number(document.getElementById("codigo").value),
            data: dataEntrada,
            tipo: "Entrada",
            motivo: "",
            quant: Number(document.getElementById("quant").value),
            valor: Number(document.getElementById("preco").value)
        }
        let requestOptions = {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(estoque)
        }
        await fetch("/estoque/registrarEntrada", requestOptions)
            .then(resp => {
                if (resp.ok) {
                    registraMovimento(mov);
                    form.reset();
                    setDataAgora();
                    exibeMensagemModal("Sucesso", "Entrada registrada.");
                } else {
                    resp.json()
                        .then(json => {
                            exibeMensagemModal(json.erro, json.mensagem);
                        })
                }
            })
            .catch(e => {
                console.log(e);
                exibeMensagemModal("Erro", e);
            })
    }
}

async function registrarSaida(e){
    e.preventDefault();
    if(validaDados()) {
        const hora = document.getElementById("horario").value + ":00";
        const data = document.getElementById("data").value;
        const dataEntrada = data + "T" + hora + "-03:00";
        const estoque = {
            id: 0,
            instrumento: {
                instru_id: Number(document.getElementById("codigo").value),
                instru_nome: document.getElementById("nome").value,
                fornecedor: {
                    id: Number(document.getElementById("fornecedor").value)
                }
            },
            quantidade: Number(document.getElementById("quant").value)
        }
        const mov = {
            id: Number(document.getElementById("codigo").value),
            data: dataEntrada,
            tipo: "Saida",
            motivo: document.getElementById("motivo").value,
            quant: Number(document.getElementById("quant").value),
            valor: 0
        }
        let requestOptions = {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(estoque)
        }
        await fetch("/estoque/registrarSaida", requestOptions)
            .then(resp => {
                if (resp.ok) {
                    registraMovimento(mov);
                    form.reset();
                    setDataAgora();
                    exibeMensagemModal("Sucesso", "Saída registrada");
                } else {
                    resp.json()
                        .then(json => {
                            exibeMensagemModal(json.erro, json.mensagem);
                        })
                }
            })
            .catch(e => {
                console.log(e);
            })
    }
}

function validaDados(){
    if(!form.checkValidity()) {
        exibeMensagemModal("Erro", "Preencha todos os campos.");
        return false;
    }
    else if(!document.getElementById("quant").value || document.getElementById("quant").value === '0') {
        exibeMensagemModal("Erro", "Insira a quantidade.");
        return false;
    }
    else if(!document.getElementById("data").value) {
        exibeMensagemModal("Erro", "Escolha uma data.");
        return false;
    }
    else if(!document.getElementById("horario").value){
        exibeMensagemModal("Erro", "Escolha um horario");
        return false;
        }
    else if(selecionada === 'e' && !document.getElementById("preco").value) {
        exibeMensagemModal("Preço inválido", "Insira um preço.");
        return false;
    }
    return true;
}

function exibeMensagemModal(subtitulo, texto){
    subitutlo.innerText = subtitulo;
    msg.innerText = texto;
    modal.show();
}

function registraMovimento(mov){
    const requestOptions = { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(mov)}
    fetch(url+"estoque/registrarMovimento?instru_id="+Number(document.getElementById("codigo").value), requestOptions)
        .then(resp =>{
            if(resp.ok)
                console.log("Movimento registrado");
        })
        .catch(e =>{
            console.log(e);
        })
}

async function constroiCategoria(){
    let cat = document.getElementById('categoria');
    const resp = await fetch(url + "categoria/get-all");
    if(resp.ok){
        const array = await resp.json();
        for(const obj of array){
            const op = document.createElement("option");
            op.innerText = obj.nome;
            op.value = obj.id;
            cat.appendChild(op);
        }
    }
}

function mascaraNumero(input) {
    input.value = input.value.replace(/\D/g, '');
}

function mascaraDecimal(input) {
    const regex = /\D/g;
    if(input.value.includes('.')) {
        if(!regex.test(input.value.substring(0, input.value.indexOf('.'))))
            input.value = input.value.substring(0, input.value.indexOf('.') + 1) + input.value.substring(input.value.indexOf('.')).replace(/\D/g, '');
        else
            input.value = input.value.substring(0,input.value.indexOf('.')).replace(/\D/g, '') + input.value.substring(input.value.indexOf('.'));
    }
    else
        input.value = input.value.replace(/[^\d.]/g, "");
}

async function constroiFornecedor(){
    let f = document.getElementById('fornecedor');
    const resp = await fetch(url + "fornecedores/listar?keyword=");
    if(resp.ok){
        const array = await resp.json();
        for(const obj of array){
            const op = document.createElement("option");
            op.innerText = obj.nome;
            op.value = obj.id;
            f.appendChild(op);
        }
    }
}

async function exibirEntrada(){
    selecionada = 'e';
    subtitulo.innerText = "Nova Entrada";
    form.innerHTML = `


                        <div class="row g-4 mb-4">
                            <div class="col-md-2">
                                <label for="codigo" class="form-label fw-semibold text-secondary small text-uppercase" style="letter-spacing: 0.05em;">Código <span class="text-danger">*</span></label>
                                <div class="input-group input-group-lg shadow-sm">
                                    <span class="input-group-text bg-light border-end-0 text-dark"><i class="bi bi-123"></i></span>
                                    <input type="text" class="form-control border-start-0 ps-0 fw-medium bg-light" id="codigo" placeholder="Código" maxlength="5" required oninput="mascaraNumero(this)">
                                </div>
                            </div>

                            <div class="col-md-10">
                                <label for="nome" class="form-label fw-semibold text-secondary small text-uppercase" style="letter-spacing: 0.05em;">Descrição <span class="text-danger">*</span></label>
                                <div class="input-group input-group-lg shadow-sm">
                                    <span class="input-group-text bg-light border-end-0 text-dark"><i class="bi bi-alphabet-uppercase"></i></span>
                                    <input type="text" class="form-control border-start-0 ps-0 fw-medium bg-light" id="nome" placeholder="Nome do produto" required>
                                </div>
                            </div>
                        </div>

                        <div class="row g-4 mb-4">

                            <div class="col-md-3">
                                <label for="fornecedor" class="form-label fw-semibold text-secondary small text-uppercase" style="letter-spacing: 0.05em;">Fornecedor <span class="text-danger">*</span></label>
                                <div class="input-group input-group-lg shadow-sm">
                                    <span class="input-group-text bg-light border-end-0 text-dark"><i class="bi bi-truck"></i></span>
                                    <select class="form-select border-start-0 ps-0 fw-medium bg-light" id="fornecedor" required style="font-size: 1rem;">
                                    </select>
                                </div>
                            </div>
                            
                             <div class="col-md-3">
                                <label for="estoque" class="form-label fw-semibold text-secondary small text-uppercase" style="letter-spacing: 0.05em;">Em estoque</label>
                                <div class="input-group input-group-lg shadow-sm">
                                    <span class="input-group-text bg-light border-end-0 text-dark"><i class="bi bi-hash"></i></span>
                                    <input disabled type="text" class="form-control border-start-0 ps-0 fw-medium bg-light" id="estoque">
                                </div>
                            </div>

                            <div class="col-md-3">
                                <label for="preco" class="form-label fw-semibold text-secondary small text-uppercase" style="letter-spacing: 0.05em;">Preço unitário <span class="text-danger">*</span></label>
                                <div class="input-group input-group-lg shadow-sm">
                                    <span class="input-group-text bg-light border-end-0 text-dark"><i class="bi bi-hash"></i></span>
                                    <input type="text" class="form-control border-start-0 ps-0 fw-medium bg-light" id="preco" value="0" placeholder="Preço" required oninput="mascaraDecimal(this)">
                                </div>
                            </div>

                            <div class="col-md-3">
                                <label for="quant" class="form-label fw-semibold text-secondary small text-uppercase" style="letter-spacing: 0.05em;">Quantidade <span class="text-danger">*</span></label>
                                <div class="input-group input-group-lg shadow-sm">
                                    <span class="input-group-text bg-light border-end-0 text-dark"><i class="bi bi-hash"></i></span>
                                    <input type="text" class="form-control border-start-0 ps-0 fw-medium bg-light" id="quant" placeholder="Quantidade" required oninput="mascaraNumero(this)">
                                </div>
                            </div>

                        </div>
                        <div class="row g-4 mb-5">
                            <div class="col-md-6">
                                <label for="data" class="form-label fw-semibold text-secondary small text-uppercase" style="letter-spacing: 0.05em;">Data de Entrada <span class="text-danger">*</span></label>
                                <div class="input-group input-group-lg shadow-sm">
                                    <span class="input-group-text bg-light border-end-0 text-taiko-red"><i class="bi bi-calendar-date"></i></span>
                                    <input type="date" class="form-control border-start-0 ps-0 fw-medium bg-light" id="data" required>
                                </div>
                            </div>

                            <div class="col-md-6">
                                <label for="horario" class="form-label fw-semibold text-secondary small text-uppercase" style="letter-spacing: 0.05em;">Horário <span class="text-danger">*</span></label>
                                <div class="input-group input-group-lg shadow-sm">
                                    <span class="input-group-text bg-light border-end-0 text-taiko-gold"><i class="bi bi-clock"></i></span>
                                    <input type="time" class="form-control border-start-0 ps-0 fw-medium bg-light" id="horario" required>
                                </div>
                            </div>
                        </div>

                        <div class="d-flex flex-column flex-md-row justify-content-end gap-3 mt-5 pt-3 border-top">
                            <button type="reset" class="btn btn-light px-4 py-3 fw-semibold text-secondary shadow-sm d-flex align-items-center justify-content-center gap-2" style="border: 1px solid #e5e7eb;">
                                <i class="bi bi-eraser fs-5"></i> Limpar
                            </button>
                            <button type="submit" onclick="registrarEntrada(event)" class="btn btn-taiko px-5 py-3 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2">
                                <i class="bi bi-check2-circle fs-5"></i> Registrar Entrada
                            </button>
                        </div>

    `
    setDataAgora();
    //await constroiCategoria();
    await constroiFornecedor();
    autocomplete(document.getElementById("nome"), vet);
    autocomplete(document.getElementById("codigo"), vet);
}

function setDataAgora(){
    let agora = new Date();
    let data = document.getElementById("data");
    let mes = agora.getMonth() + 1;
    let dia = agora.getDate();
    if(dia%10 === dia)
        dia = "0" + dia.toString();
    if(mes%10 === mes)
        mes = "0" + mes.toString();
    let ano = agora.getFullYear();
    let horario = document.getElementById("horario");
    let horas = agora.getHours();
    let minutos = agora.getMinutes();
    if(horas%10 === horas)
        horas = "0" + horas;
    if(minutos%10 === minutos)
        minutos = "0" + minutos;
    horario.value = horas + ":" + minutos;
    data.value = ano + "-" + mes + "-" + dia;
}

async function exibirSaida(){
    selecionada = 's';
    subtitulo.innerText = "Saída de produto";
    form.innerHTML = `


                                <div class="row g-4 mb-4">
                                    <div class="col-md-2">
                                        <label for="codigo" class="form-label fw-semibold text-secondary small text-uppercase" style="letter-spacing: 0.05em;">Código <span class="text-danger">*</span></label>
                                        <div class="input-group input-group-lg shadow-sm">
                                            <span class="input-group-text bg-light border-end-0 text-dark"><i class="bi bi-123"></i></span>
                                            <input type="text" class="form-control border-start-0 ps-0 fw-medium bg-light" id="codigo" placeholder="Código" maxlength="5" required oninput="mascaraNumero(this)">
                                        </div>
                                    </div>

                                    <div class="col-md-10">
                                        <label for="nome" class="form-label fw-semibold text-secondary small text-uppercase" style="letter-spacing: 0.05em;">Descrição <span class="text-danger">*</span></label>
                                        <div class="input-group input-group-lg shadow-sm">
                                            <span class="input-group-text bg-light border-end-0 text-dark"><i class="bi bi-alphabet-uppercase"></i></span>
                                            <input type="text" class="form-control border-start-0 ps-0 fw-medium bg-light" id="nome" placeholder="Nome do produto" required>
                                        </div>
                                    </div>
                                </div>

                                <div class="row g-4 mb-4">

                                    <div class="col-md-4">
                                        <label for="fornecedor" class="form-label fw-semibold text-secondary small text-uppercase" style="letter-spacing: 0.05em;">Fornecedor <span class="text-danger">*</span></label>
                                        <div class="input-group input-group-lg shadow-sm">
                                            <span class="input-group-text bg-light border-end-0 text-dark"><i class="bi bi-truck"></i></span>
                                            <select class="form-select border-start-0 ps-0 fw-medium bg-light" id="fornecedor" required style="font-size: 1rem;">
                                            </select>
                                        </div>
                                    </div>

                                    <div class="col-md-4">
                                        <label for="estoque" class="form-label fw-semibold text-secondary small text-uppercase" style="letter-spacing: 0.05em;">Em estoque</label>
                                        <div class="input-group input-group-lg shadow-sm">
                                            <span class="input-group-text bg-light border-end-0 text-dark"><i class="bi bi-hash"></i></span>
                                            <input disabled type="text" class="form-control border-start-0 ps-0 fw-medium bg-light" id="estoque">
                                        </div>
                                    </div>
                                    
                                    <div class="col-md-4">
                                        <label for="quant" class="form-label fw-semibold text-secondary small text-uppercase" style="letter-spacing: 0.05em;">Quantidade <span class="text-danger">*</span></label>
                                        <div class="input-group input-group-lg shadow-sm">
                                            <span class="input-group-text bg-light border-end-0 text-dark"><i class="bi bi-hash"></i></span>
                                            <input type="text" class="form-control border-start-0 ps-0 fw-medium bg-light" id="quant" placeholder="Quantidade" required oninput="mascaraNumero(this)">
                                        </div>
                                    </div>

                                </div>
                                <div class="row g-4 mb-5">
                                    <div class="col-md-6">
                                        <label for="data" class="form-label fw-semibold text-secondary small text-uppercase" style="letter-spacing: 0.05em;">Data de Saída <span class="text-danger">*</span></label>
                                        <div class="input-group input-group-lg shadow-sm">
                                            <span class="input-group-text bg-light border-end-0 text-taiko-red"><i class="bi bi-calendar-date"></i></span>
                                            <input type="date" class="form-control border-start-0 ps-0 fw-medium bg-light" id="data" required>
                                        </div>
                                    </div>

                                    <div class="col-md-6">
                                        <label for="horario" class="form-label fw-semibold text-secondary small text-uppercase" style="letter-spacing: 0.05em;">Horário <span class="text-danger">*</span></label>
                                        <div class="input-group input-group-lg shadow-sm">
                                            <span class="input-group-text bg-light border-end-0 text-taiko-gold"><i class="bi bi-clock"></i></span>
                                            <input type="time" class="form-control border-start-0 ps-0 fw-medium bg-light" id="horario" required>
                                        </div>
                                    </div>
                                </div>

                                <div class="row">
                                    <div >
                                        <label for="motivo" class="form-label fw-semibold text-secondary small text-uppercase" style="letter-spacing: 0.05em;">Motivo (opcional)</label>
                                        <div class="input-group input-group-lg shadow-sm">
                                            <textarea rows="3" class="form-control border-start-0 ps-0 fw-medium bg-light" id="motivo" placeholder="Descreva o motivo da saída"></textarea>
                                        </div>
                                    </div>
                                </div>

                                <div class="d-flex flex-column flex-md-row justify-content-end gap-3 mt-5 pt-3 border-top">
                                    <button type="reset" class="btn btn-light px-4 py-3 fw-semibold text-secondary shadow-sm d-flex align-items-center justify-content-center gap-2" style="border: 1px solid #e5e7eb;">
                                        <i class="bi bi-eraser fs-5"></i> Limpar
                                    </button>
                                    <button type="submit" onclick="registrarSaida(event)" class="btn btn-taiko px-5 py-3 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2">
                                        <i class="bi bi-check2-circle fs-5"></i> Registrar Saída
                                    </button>
                                </div>

    `
    setDataAgora();
    await constroiFornecedor()
    autocomplete(document.getElementById("nome"), vet);
    autocomplete(document.getElementById("codigo"), vet);
}

async function autocomplete(inp, arr) {
  /*the autocomplete function takes two arguments,
  the text field element and an array of possible autocompleted values:*/
  var currentFocus;
  /*execute a function when someone writes in the text field:*/
  inp.addEventListener("input", async function(e) {
      var a, b, i, val = this.value;
      let resp, fornecedor, codigo, nome, estoque;
      fornecedor = document.getElementById("fornecedor");
      codigo = document.getElementById("codigo");
      nome = document.getElementById("nome");
      /*close any already open lists of autocompleted values*/
      closeAllLists();
      if (!val) { return false;}
      currentFocus = -1;
      /*create a DIV element that will contain the items (values):*/
      a = document.createElement("DIV");
      a.setAttribute("id", this.id + "autocomplete-list");
      if(e.target.id === "codigo") {
          a.setAttribute("class", "autocomplete-items-2");
          inputSelecionado = "codigo";
          resp = await fetch(url+"estoque/get-instrumento-filter?tipo=codigo&filter="+val);
      }
      else {
          a.setAttribute("class", "autocomplete-items");
          inputSelecionado = "nome";
          resp = await fetch(url+"estoque/get-instrumento-filter?tipo=nome&filter="+val);
      }
      arr = await resp.json();
      /*append the DIV element as a child of the autocomplete container:*/
      this.parentNode.appendChild(a);
      /*for each item in the array...*/
      for (i = 0; i < arr.length; i++) {
        /*check if the item starts with the same letters as the text field value:*/
        // if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
          /*create a DIV element for each matching element:*/
          b = document.createElement("DIV");
          /*make the matching letters bold:*/
          // b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
          // b.innerHTML += arr[i].substr(val.length);
          /*insert a input field that will hold the current array item's value:*/
          if(inputSelecionado === "codigo") {
              b.innerHTML = arr[i].instru_id;
              b.innerHTML += "<input type='hidden' value='" + arr[i].instru_id + "'>";
          }
          else {
              b.innerHTML = arr[i].instru_nome;
              b.innerHTML += "<input type='hidden' value='" + arr[i].instru_nome + "' name = "+arr[i].instru_id+" id = "+i+">";
          }
          b.id = i;
          /*execute a function when someone clicks on the item value (DIV element):*/
              b.addEventListener("click", async function(e) {
              /*insert the value for the autocomplete text field:*/
              inp.value = this.getElementsByTagName("input")[0].value;
              if(inputSelecionado === "nome")
                  codigo.value = this.getElementsByTagName("input")[0].name;
              else{
                  nome.value = arr[Number(b.id)].instru_nome;
              }
              resp = await fetch(url+"estoque/getEstoqueId?id="+this.getElementsByTagName("input")[0].name);
              estoque = await resp.json();
              document.getElementById("estoque").value = estoque.quantidade;
              fornecedor.selectedIndex = buscaIndex("fornecedor", arr[Number(this.getElementsByTagName("input")[0].id)].fornecedor.nome);
              /*close the list of autocompleted values,
              (or any other open lists of autocompleted values:*/
              closeAllLists();
          });
          a.appendChild(b);
        // }
      }
  });
  /*execute a function presses a key on the keyboard:*/
  inp.addEventListener("keydown", function(e) {
      var x = document.getElementById(this.id + "autocomplete-list");
      if (x) x = x.getElementsByTagName("div");
      if (e.keyCode == 40) {
        /*If the arrow DOWN key is pressed,
        increase the currentFocus variable:*/
        currentFocus++;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 38) { //up
        /*If the arrow UP key is pressed,
        decrease the currentFocus variable:*/
        currentFocus--;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 13) {
        /*If the ENTER key is pressed, prevent the form from being submitted,*/
        e.preventDefault();
        if (currentFocus > -1) {
          /*and simulate a click on the "active" item:*/
          if (x) x[currentFocus].click();
        }
      }
  });
  function addActive(x) {
    /*a function to classify an item as "active":*/
    if (!x) return false;
    /*start by removing the "active" class on all items:*/
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    /*add class "autocomplete-active":*/
    x[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(x) {
    /*a function to remove the "active" class from all autocomplete items:*/
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }
  function closeAllLists(elmnt) {
    /*close all autocomplete lists in the document,
    except the one passed as an argument:*/
    var x;
    if(inputSelecionado === "codigo")
        x = document.getElementsByClassName("autocomplete-items-2");
    else
        x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
          x[i].parentNode.removeChild(x[i]);
    }
  }
}
/*execute a function when someone clicks in the document:*/
document.addEventListener("click", function (e) {
    closeAllLists(e.target);
});
}

function buscaIndex(id, chave){
    const select = document.getElementById(id).options;
    let i;
    for(i = 0; i<select.length && select[i].innerText !== chave; i++);
    return i;
}