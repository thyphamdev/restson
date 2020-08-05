const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const request = require('request-promise');

const { expect } = chai;
chai.use(chaiAsPromised);

const url = 'http://localhost:8081/api/v1';

describe('Middlewares test', () => {
  it('should execute middleware in all sub routes', async () => {
    const response = await request.get(`${url}/greeting/`);
    expect(response).to.be.equal('Hello ');
  });

  it('should execute middleware for specific route', async () => {
    const response = await request.get(`${url}/greeting/name/`);
    expect(response).to.be.equal('Hello Name Middleware');
  });

  it('should execute middleware for specific method', async () => {
    const response = await request.get(`${url}/greeting/name/`);
    expect(response).to.be.equal('Hello Name Middleware');
  });
});
