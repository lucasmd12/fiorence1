// ARQUIVO: src/static/src/components/Login.jsx (CORRIGIDO)

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
// 1. IMPORTAR A FUNÇÃO 'post' DO apiClient
import { post } from '../lib/apiClient';

// Importamos o auth do firebase para o login com token que o backend vai retornar
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from '../lib/firebase';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    displayName: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  // 2. FUNÇÃO DE LOGIN ATUALIZADA
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Usa o método 'post' do apiClient
      const data = await post('/auth/username-login', {
        username: formData.username,
        password: formData.password
      });

      // O backend nos deu um token customizado do Firebase.
      // Agora usamos esse token para fazer login no frontend.
      await signInWithCustomToken(auth, data.token);
      // O AuthProvider vai detectar o login e redirecionar a página.
      // Não precisamos mais verificar 'data.success' pois o apiClient já trata erros.

    } catch (err) {
      console.error('Erro no login:', err);
      setError(err.message || 'Nome de usuário ou senha inválidos');
      setIsLoading(false);
    }
  };

  // 3. FUNÇÃO DE REGISTRO ATUALIZADA
  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Usa o método 'post' do apiClient
      const data = await post('/auth/register-with-username', {
        username: formData.username,
        password: formData.password,
        display_name: formData.displayName
      });

      // Após o registro, o backend já retorna um token para login automático.
      await signInWithCustomToken(auth, data.token);
      // O AuthProvider vai detectar o login e redirecionar.

    } catch (err) {
      console.error('Erro no registro:', err);
      setError(err.message || 'Não foi possível criar a conta.');
      setIsLoading(false);
    }
  };

  // O RESTANTE DO CÓDIGO (JSX) PERMANECE EXATAMENTE O MESMO...
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            FIORENCE CONTABIL
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            GESTAO INTELIGENTE
          </p>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-center">Acesse sua conta</CardTitle>
            <CardDescription className="text-center">
              Use seu nome de usuário e senha ou crie uma nova conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="register">Criar Conta</TabsTrigger>
              </TabsList>

              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Formulário de Login Modificado */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username-login">Nome de Usuário</Label>
                    <Input
                      id="username-login"
                      name="username"
                      type="text"
                      required
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="Seu nome de usuário"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password-login">Senha</Label>
                    <div className="relative">
                      <Input
                        id="password-login"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Sua senha"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Entrando...</> : 'Entrar'}
                  </Button>
                </form>
              </TabsContent>

              {/* Formulário de Registro Modificado */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName-register">Nome Completo</Label>
                    <Input
                      id="displayName-register"
                      name="displayName"
                      type="text"
                      required
                      value={formData.displayName}
                      onChange={handleInputChange}
                      placeholder="Como você quer ser chamado"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username-register">Nome de Usuário</Label>
                    <Input
                      id="username-register"
                      name="username"
                      type="text"
                      required
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="Crie um nome de usuário único"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password-register">Senha</Label>
                    <div className="relative">
                      <Input
                        id="password-register"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Mínimo 6 caracteres"
                        minLength={6}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Criando conta...</> : 'Criar Conta'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
