# Слово client в скобках автоматически берется из нашего conftest.py
def test_create_user(client):
    # 1. Отправляем POST запрос, как если бы мы были фронтендом
    response = client.post(
        "/users/",
        json={"email": "test@example.com", "username": "testuser", "password": "superpassword"}
    )
    
    # 2. Проверяем, что сервер ответил кодом 200 (Успех)
    assert response.status_code == 200, response.text
    
    # 3. Достаем JSON из ответа
    data = response.json()
    
    # 4. Проверяем, что сервер вернул правильные данные
    assert data["email"] == "test@example.com"
    assert data["username"] == "testuser"
    assert "id" in data # Проверяем, что база выдала ID
    assert "password" not in data # ВАЖНО: проверяем, что пароль не утек в ответ!

def test_create_existing_user(client):
    # Пытаемся создать того же юзера второй раз
    response = client.post(
        "/users/",
        json={"email": "test@example.com", "username": "testuser", "password": "superpassword"}
    )
    
    # Проверяем, что сервер выдал ошибку 400 (Bad Request)
    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered"