// Importa hooks do React
import { useState, useEffect, useRef } from "react";
import { Button, Platform, View, Text } from "react-native";
// Importa módulos do Expo
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
// ■ Configura como as notificações aparecerão
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, // Exibir alerta na tela
    shouldPlaySound: true, // Tocar som
    shouldSetBadge: false, // Badge no ícone
  }),
});
export default function App() {
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();
  useEffect(() => {
    // Pega o token e exibe no console
    registerForPushNotificationsAsync().then((token) => {
      console.log("TOKEN EXPO ==> ", token); // ■ AQUI MOSTRA O TOKEN NO TERMINAL
      setExpoPushToken(token);
    });
    // Listener quando a notificação chega
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });
    // Listener quando toca na notificação
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Usuário clicou na notificação:", response);
      });
    // Cleanup dos listeners
    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {/* Exibe o token do Expo na tela */}
      <Text style={{ padding: 10 }}>Expo Push Token:</Text>
      <Text style={{ padding: 10 }}>{expoPushToken}</Text>
      {/* Botão que envia notificação local */}
      <Button
        title="Enviar notificação local"
        onPress={async () => {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "Olá Nilson ■",
              body: "Essa é uma notificação local programada!",
            },
            trigger: { seconds: 2 },
          });

        }}
      />
      {/* Exibe a última notificação recebida */}
      <Text style={{ marginTop: 20 }}>
        Última notificação:{" "}
        {notification ? notification.request.content.body : "Nenhuma ainda"}
      </Text>
    </View>
  );
}
// ■ Função para pedir permissão e pegar o token
async function registerForPushNotificationsAsync() {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Permissão negada!");
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    alert("TOKEN EXPO OBTIDO: ", token);
  } else {
    alert("Você precisa testar em um dispositivo físico!");
  }
  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }
  return token;
}