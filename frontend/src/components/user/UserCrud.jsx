import React, { Component } from 'react'
import axios from 'axios'
import Main from '../template/Main'

const headerProps = {
    icon: 'users',
    title: 'Usuários',
    subtitle: 'Registrar Funcionario - Calculos do IRRF'
}

const baseUrl = 'http://localhost:3001/users'
const initialState = {
    user: { name: '', cpf: '', salario: '', desconto: '', dependentes: '',irpf:'' },
    list: []
}

export default class UserCrud extends Component {

    state = { ...initialState }

    componentWillMount() {
        axios(baseUrl).then(resp => {
            this.setState({ list: resp.data })
        })
    }

    clear() {
        this.setState({ user: initialState.user })
    }

    save() {
        const user = this.state.user
        const method = user.id ? 'put' : 'post'
        const url = user.id ? `${baseUrl}/${user.id}` : baseUrl
        axios[method](url, user)
            .then(resp => {
                const list = this.getUpdatedList(resp.data)
                this.setState({ user: initialState.user, list })
            })
    }

    getUpdatedList(user, add = true) {
        const list = this.state.list.filter(u => u.id !== user.id)
        if (add) list.unshift(user)
        return list
    }

    updateField(event) {
        const user = { ...this.state.user }
        user[event.target.name] = event.target.value
        this.setState({ user })
    }




    renderForm() {
        return (
            <div className="form">
                <div className="row">
                    <div className="col-12 col-md-6">
                        <div className="form-group">
                            <label>Nome</label>
                            <input type="text" className="form-control"
                                name="name"
                                value={this.state.user.name}
                                onChange={e => this.updateField(e)}
                                placeholder="Digite o nome..." />
                        </div>
                    </div>

                    <div className="col-12 col-md-6">
                        <div className="form-group">
                            <label>CPF</label>
                            <input type="text" className="form-control"
                                name="cpf"
                                value={this.state.user.cpf}
                                onChange={e => this.updateField(e)}
                                placeholder="Digite seu CPF." />
                        </div>
                    </div>

                    <div className="col-12 col-md-6">
                        <div className="form-group">
                            <label>Salário bruto</label>
                            <input type="text" className="form-control"
                                name="salario"
                                value={this.state.user.salario}
                                onChange={e => this.updateField(e)}
                                placeholder="Digite o seu salário..." />
                        </div>
                    </div>

                    <div className="col-12 col-md-6">
                        <div className="form-group">
                            <label>Desconto da previdência</label>
                            <input type="text" className="form-control"
                                name="desconto"
                                value={this.state.user.desconto}
                                onChange={e => this.updateField(e)}
                                placeholder="Digite o desconto da previdência..." />
                        </div>
                    </div>


                    <div className="col-12 col-md-6">
                        <div className="form-group">
                            <label>Número de dependentes</label>
                            <input type="text" className="form-control"
                                name="dependentes"
                                value={this.state.user.dependentes}
                                onChange={e => this.updateField(e)}
                                placeholder="Digite o numero de dependentes..." />
                        </div>
                    </div>


                </div>

                <hr />
                <div className="row">
                    <div className="col-12 d-flex justify-content-end">
                        <button className="btn btn-primary"
                            onClick={e => this.save(e)}>
                            Salvar
                        </button>

                        <button className="btn btn-secondary ml-2"
                            onClick={e => this.clear(e)}>
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    load(user) {
        this.setState({ user })
    }

    remove(user) {
        axios.delete(`${baseUrl}/${user.id}`).then(resp => {
            const list = this.getUpdatedList(user, false)
            this.setState({ list })
        })
    }

    renderTable() {
        return (
            <table className="table mt-4">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>CPF</th>
                        <th>Salário</th>
                        <th>Desconto</th>
                        <th>Número de dependentes</th>
                        <th>Desconto IRPF</th>
                        <th>Ações</th>

                    </tr>
                </thead>
                <tbody>
                    {this.renderRows()}
                </tbody>
            </table>
        )
    }

    calculationIRRF(salario, desconto, dependentes) {
        let resultBaseIr = 0
        this.resultFinal = ''

        let calculationDependente = dependentes * 164.56
        let calculationFinalBase = salario - desconto - calculationDependente * dependentes
        resultBaseIr = calculationFinalBase

        if (resultBaseIr >= 0 && resultBaseIr <= 1903.98) {
            this.resultFinal = 0
        } else if (resultBaseIr >= 1903.99 && resultBaseIr <= 2826.65) {
            this.resultFinal = resultBaseIr * 0.075 - 142.80
        } else if (resultBaseIr >= 2826.66 && resultBaseIr <= 3751.05) {
            this.resultFinal = resultBaseIr * 0.15 - 354.80
        } else if (resultBaseIr >= 3751.06 && resultBaseIr <= 4664.68) {
            this.resultFinal = resultBaseIr * 0.225 - 636.13
        } else if (resultBaseIr > 4664.68) {
            this.resultFinal = resultBaseIr * 0.275 - 869.36
        } 
    }

    renderRows() {
        return this.state.list.map(user => {
            return (
                <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.cpf}</td>
                    <td>{user.salario}</td>
                    <td>{user.desconto}</td>
                    <td>{user.dependentes}</td>
                    <td>{user.irpf || this.resultFinal }</td>
                    <td>
                        <button className="btn btn-warning"
                            onClick={() => this.load(user)}>
                            <i className="fa fa-pencil"></i>
                        </button>
                        <button className="btn btn-danger ml-2"
                            onClick={() => this.remove(user)}>
                            <i className="fa fa-trash"></i>
                        </button>
                    </td>
                </tr>
            )
        })
    }






    render() {
        return (
            <Main {...headerProps}>
                {this.renderForm()}
                {this.renderTable()}
                {this.calculationIRRF(parseFloat(this.state.user.salario), parseFloat(this.state.user.desconto), parseFloat(this.state.user.dependentes))}
            </Main>
        )
    }
}