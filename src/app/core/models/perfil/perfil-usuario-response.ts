import { FotosResponse } from "../fotos/fotos-response";


export interface PerfilUsuarioResponse {

  id: string;

  nomeUsuario: string;

  login: string;

  dataCadastro: string;

  status: number;

  email: string;

  endereco?: string;

  telefone?: string;

  genero?: string;

  foto?: FotosResponse;

  grupoSetores?: any[];

  grupoNiveis?: any[];
}