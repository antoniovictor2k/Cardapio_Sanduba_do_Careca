const Celular = "558291981626";
const text = "Oii, tenho Interesse em adquirir um site com vcs :)";

const carregarAPIWhatsap = () => {
    $('.aDev').attr('href', `https://wa.me/${Celular}?text=${text}`)
};
