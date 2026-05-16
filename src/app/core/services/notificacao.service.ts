import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.development";
import { HttpClient } from "@angular/common/http";
import { Notificacao } from "../models/notficacao/notificacao";

@Injectable({
    providedIn: 'root' // Isso registra o serviço automaticamente no app
})
export class NotificacoService {
    private url = environment.apiDeslandes;
    private http = inject(HttpClient);

getNotificacoes(usuarioId: string) {
  console.log('📡 Buscando notificações do usuário:', usuarioId);

  return this.http.get<Notificacao[]>(
    `${environment.apiDeslandes}/api/v1/notificacoes/${usuarioId}`
  );
}
marcarComoLida(id: string) {
  return this.http.put(
    `${environment.apiDeslandes}/api/v1/notificacoes/marcar-lida/${id}`,
    {}
  );
}
}