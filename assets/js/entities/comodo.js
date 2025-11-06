class Comodo {
    constructor(codigo, nome, icone) {
        this.codigo = codigo || this.gerarCodigo();
        this.nome = nome;
        this.icone = icone;
    }

    gerarCodigo() {
        // Gera um código único baseado no timestamp para simplificar
        // Em um ambiente real, você pode querer um gerador mais robusto
        return Date.now();
    }
}
