export interface NivelUsuario {
  idNivel: string;
  nomeNivel: string;
}

export interface AutenticarUsuarioResponse {
  id: string;
  login: string;
  nomeUsuario: string;
  sexo: string;
  nivel: NivelUsuario[];
  dataHoraAcesso: string;
  accessToken: string;
  dataHoraExpiracao: string;

}