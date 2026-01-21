class authService{
    constructor(api){
        this.api=api;
    }

    login = async(user, password)=>{
        const response = await this.api.post('/auth/login', {user, password});
        this.setTokens(response.data);
        return response.data.user;
    };

    logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    setTokens = (data)=> {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
    };

    getCurrentUser = ()=>{
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    };

    isAuthenticated = ()=>{
        return !!localStorage.getItem('token');
    };
}


export default authService;