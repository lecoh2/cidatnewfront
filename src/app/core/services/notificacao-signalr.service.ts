import { inject, Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';

import { environment } from '../../../environments/environment.development';
import { AuthHelper } from '../helpers/auth.helper';

@Injectable({ providedIn: 'root' })
export class NotificacaoSignalRService {

  private hubConnection!: signalR.HubConnection;
  private authHelper = inject(AuthHelper);

  iniciar(usuarioId: string, callback: (data: any) => void) {

    this.hubConnection = new signalR.HubConnectionBuilder()
  .withUrl(`${environment.apiDeslandes}/hub/notificacao`, {
accessTokenFactory: () => {

  const user = this.authHelper.get();

  console.log('TOKEN:', user?.accessToken);

  if (user?.accessToken) {

    const payload = JSON.parse(
      atob(user.accessToken.split('.')[1])
    );

    console.log('JWT PAYLOAD:', payload);
  }

  return user?.accessToken ?? '';
}
})
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start()
      .then(() => console.log('🟢 SignalR conectado'))
      .catch(err => console.error('Erro SignalR', err));

    this.hubConnection.on('ReceberNotificacao', (data: any) => {
      console.log('🔔 RECEBEU:', data);
      callback(data);
    });
  }
  onNotificacaoLida(callback: (id: string) => void) {

  this.hubConnection.on(
    'NotificacaoLida',
    (id: string) => {
      callback(id);
    }
  );
}
}