const { expect } = require('chai');
const { ethers, web3 } = require ('hardhat');
const {expectRevert} = require('@openzeppelin/test-helpers');
const { asyncIterator } = require('core-js/es6/symbol');


describe("DFGlobalEscrow_Unit_Tests_ETH", function(){
    let deployer, sender, receiver, agent;
    let ZeroAddress = '0x0000000000000000000000000000000000000000';
    let escrow;

    beforeEach(async function(){
        [deployer,sender,receiver,agent, randomUser] = await ethers.getSigners();
        console.log("deployer", deployer.address);
        console.log("sender",sender.address);
        // let escrowContract = await ethers.getContractFactory("DFGlobalEscrow");
        // escrow = await escrowContract.connect(deployer).deploy();
        // await escrow.deployed();

        // await escrow.connect(sender).createEscrow(
        //     "abc123",
        //     sender.address,
        //     receiver.address,
        //     agent.address,
        //     0,
        //     ZeroAddress,
        //     100000000000000n,
        //     {value: 100000000000000n}
        //     );
    })

    it('sender cannot sign release before escrow is funded', async function(){
        await expectRevert(escrow.connect(sender)
        .release('abc123',sender.address), 'escrow should be funded first')
    })

    it('sender cannot sign revert before escrow is funded', async function(){
        await expectRevert(escrow.connect(sender)
        .reverse('abc123',sender.address), 'escrow should be funded first')
    })

    it('sender cannot dispute before escrow is funded', async function(){
        await expectRevert(escrow.connect(sender)
        .dispute('abc123',sender.address), 'escrow should be funded first')
    })

    it('recipient cannot sign release before escrow is funded', async function(){
        await expectRevert(escrow.connect(sender)
        .release('abc123',receiver.address), 'escrow should be funded first')
    })

    it('recipient cannot sign revert before escrow is funded', async function(){
        await expectRevert(escrow.connect(sender)
        .reverse('abc123',receiver.address), 'escrow should be funded first')
    })
    
    it('recipient cannot dispute before escrow is funded', async function(){
        await expectRevert(escrow.connect(sender)
        .dispute('abc123',sender.address), 'escrow should be funded first')
    })

    it('agent cannot sign release before escrow is funded', async function(){
        await expectRevert(escrow.connect(sender)
        .release('abc123',agent.address), 'escrow should be funded first')
    })

    it('agent cannot sign revert before escrow is funded', async function(){
        await expectRevert(escrow.connect(sender)
        .reverse('abc123',agent.address), 'escrow should be funded first')
    })

    it('receiver cannot fund the escrow', async function(){
        await expectRevert(escrow.connect(receiver).fund('abc123',100000000000000n, {value:100000000000000n}, 'Receiver cannot fund the escrow'));
    })

    it('agent cannot fund the escrow', async function(){
        await expectRevert(escrow.connect(agent).fund('abc123',100000000000000n, {value:100000000000000n}, 'Agent cannot fund the escrow'));
    })

    it('should fail if a random address try to fund the escrow', async function(){
        await expectRevert(escrow.connect(randomUser).fund('abc123',100000000000000n, {value:100000000000000n}, 'Random user cannot fund the escrow'));
    })

    it('only sender can fund the escrow with exact amount', async function() {
        //await escrow.connect(sender).fund('abc123',100000000000000n);
        await expect(escrow.connect(sender).fund(
            'abc123',100000000000000n,
            {value:100000000000000n})
            )
            .to.emit(escrow,'Funded').withArgs('abc123',sender.address,100000000000000n);
    })

    it('should fail if funded with higher amount', async function() {
        //await escrow.connect(sender).fund('abc123',1000000000000000n);
        await expectRevert(escrow.connect(sender).fund(
            'abc123',1000000000000000n,
            {value:1000000000000000n})
            )
    })

    it('should fail if funded with lower amount', async function() {
        //await escrow.connect(sender).fund('abc123',10000000000000n);
        await expectRevert(escrow.connect(sender).fund(
            'abc123',10000000000000n,
            {value:10000000000000n})
            )
    })

    it('should fail if funded twice/multiple times', async function(){
        //await escrow.connect(sender).fund('abc123',100000000000000n);
        await expect(escrow.connect(sender).fund(
            'abc123',100000000000000n,
            {value:100000000000000n})
            )
            .to.emit(escrow,'Funded').withArgs('abc123',sender.address,100000000000000n);

            //await escrow.connect(sender).fund('abc123',100000000000000n);
        await expectRevert(escrow.connect(sender).fund(
            'abc123',100000000000000n,
            {value:100000000000000n})
            );
    })

    it('sender can sign release if escrow is funded', async function(){
        await escrow.connect(sender).fund('abc123',1000000000000000n,
        {value:100000000000000n});
        await expect(escrow.connect(sender).release('abc123', sender.address)).
        to.emit(escrow,'Signature').withArgs('abc123',sender.address,2);
    })

    it('recipient can sign release if escrow is funded', async function(){
        await escrow.connect(sender).fund('abc123',1000000000000000n,
        {value:100000000000000n});
        await expect(escrow.connect(receiver).release('abc123', receiver.address)).
        to.emit(escrow,'Signature').withArgs('abc123',receiver.address,2);
    })

    it('should fail if agent try to sign release without dispute in funded escrow', async function(){
        await escrow.connect(sender).fund('abc123',1000000000000000n,
        {value:100000000000000n});
        await expectRevert(escrow.connect(agent).release('abc123',agent.address));
    })

    it('sender can sign revert if escrow is funded', async function(){
        await escrow.connect(sender).fund('abc123',1000000000000000n,
        {value:100000000000000n});
        await expect(escrow.connect(sender).reverse('abc123', sender.address)).
        to.emit(escrow,'Signature').withArgs('abc123',sender.address,2);
    })

    it('recipient can sign revert if escrow is funded', async function(){
        await expect(escrow.connect(receiver).reverse('abc123', receiver.address,
        {value:100000000000000n})).
        to.emit(escrow,'Signature').withArgs('abc123',receiver.address,2);
    })

    it('should fail if agent try to sign revert without dispute in funded escrow', async function(){
        await escrow.connect(sender).fund('abc123',1000000000000000n,
        {value:100000000000000n});
        await expectRevert(escrow.connect(agent).release('abc123',agent.address));
    })

    it('should fail if sender sign release twice', async function(){
        await escrow.connect(sender).fund('abc123',1000000000000000n,
        {value:100000000000000n});

        await escrow.connect(sender).release('abc123', sender.address);
        await expectRevert(escrow.connect(sender).release('abc123', sender.address));
    })

    it('should fail if recipient sign release twice', async function(){
        await escrow.connect(sender).fund('abc123',1000000000000000n,
        {value:100000000000000n});

        await escrow.connect(receiver).release('abc123', receiver.address);
        await expectRevert(escrow.connect(receiver).release('abc123', receiver.address));
    })
    
    it('should fail if sender sign reverse twice', async function(){
        await escrow.connect(sender).fund('abc123',1000000000000000n,
        {value:100000000000000n});

        await escrow.connect(sender).reverse('abc123', sender.address);
        await expectRevert(escrow.connect(sender).reverse('abc123', sender.address));
    })

    it('should fail if recipient sign reverse twice', async function(){
        await escrow.connect(sender).fund('abc123',1000000000000000n,
        {value:100000000000000n});

        await escrow.connect(receiver).reverse('abc123', receiver.address);
        await expectRevert(escrow.connect(receiver).reverse('abc123', receiver.address));
    })

    it('should fail if sender try to replace release with reverse', async function(){
        await escrow.connect(sender).fund('abc123',1000000000000000n,
        {value:100000000000000n});

        await escrow.connect(sender).release('abc123', sender.address);
        await expectRevert(escrow.connect(sender).reverse('abc123', sender.address));
    })

    it('should fail if recipient try to replace release with reverse', async function(){
        await escrow.connect(sender).fund('abc123',1000000000000000n,
        {value:100000000000000n});

        await escrow.connect(receiver).release('abc123', receiver.address);
        await expectRevert(escrow.connect(receiver).reverse('abc123', receiver.address));
    })

    it('should fail if sender try to replace reverse with release', async function(){
        await escrow.connect(sender).fund('abc123',1000000000000000n,
        {value:100000000000000n});

        await escrow.connect(sender).reverse('abc123', sender.address);
        await expectRevert(escrow.connect(sender).release('abc123', sender.address));
    })

    it('should fail if recipient try to replace reverse with release', async function(){
        await escrow.connect(sender).fund('abc123',1000000000000000n,
        {value:100000000000000n});

        await escrow.connect(receiver).reverse('abc123', receiver.address);
        await expectRevert(escrow.connect(receiver).release('abc123', receiver.address));
    })

    it('sender can dispute after funding', async function() {
        await escrow.connect(sender).fund('abc123',1000000000000000n,
        {value:100000000000000n});

        await expect(escrow.connect(sender).dispute('abc123', sender)).to.emit(
            escrow,
            'Disputed'
        ).withArgs('abc123',sender.address);
    })

    it('receiver can dispute after funding', async function() {
        await escrow.connect(sender).fund('abc123',1000000000000000n,
        {value:100000000000000n});

        await expect(escrow.connect(receiver).dispute('abc123', receiver.address)).to.emit(
            escrow,
            'Disputed'
        ).withArgs('abc123',receiver.address);
    })

    it('should fail if sender sign release for recipient', async function(){
        await escrow.connect(sender).fund('abc123',1000000000000000n,
        {value:100000000000000n});

        //await escrow.connect(receiver).reverse('abc123', receiver.address);
        await expectRevert(escrow.connect(sender).release('abc123', receiver.address));
    })

    it('should fail if sender sign reverse for recipient', async function(){
        await escrow.connect(sender).fund('abc123',1000000000000000n,
        {value:100000000000000n});

        //await escrow.connect(receiver).reverse('abc123', receiver.address);
        await expectRevert(escrow.connect(sender).reverse('abc123', receiver.address));
    })

    it('should fail if sender dispute for recipient', async function(){
        await escrow.connect(sender).fund('abc123',1000000000000000n,
        {value:100000000000000n});

        //await escrow.connect(receiver).reverse('abc123', receiver.address);
        await expectRevert(escrow.connect(sender).dispute('abc123', receiver.address));
    })

    it('should fail if receiver sign release for sender', async function(){
        await escrow.connect(sender).fund('abc123',1000000000000000n,
        {value:100000000000000n});

        //await escrow.connect(receiver).reverse('abc123', receiver.address);
        await expectRevert(escrow.connect(receiver).release('abc123', sender.address));
    })

    it('should fail if receiver sign reverse for sender', async function(){
        await escrow.connect(sender).fund('abc123',1000000000000000n,
        {value:100000000000000n});

        //await escrow.connect(receiver).reverse('abc123', receiver.address);
        await expectRevert(escrow.connect(receiver).reverse('abc123', sender.address));
    })

    it('should fail if receiver dispute for sender', async function(){
        await escrow.connect(sender).fund('abc123',1000000000000000n,
        {value:100000000000000n});

        //await escrow.connect(receiver).reverse('abc123', receiver.address);
        await expectRevert(escrow.connect(receiver).dispute('abc123', sender.address));
    })



    it('should fail if agent sign release for sender', async function(){
        await escrow.connect(sender).fund('abc123',1000000000000000n,
        {value:100000000000000n});

        //await escrow.connect(receiver).reverse('abc123', receiver.address);
        await expectRevert(escrow.connect(agent).release('abc123', sender.address));
    })

    it('should fail if agent sign reverse for sender', async function(){
        await escrow.connect(sender).fund('abc123',1000000000000000n,
        {value:100000000000000n});

        //await escrow.connect(receiver).reverse('abc123', receiver.address);
        await expectRevert(escrow.connect(agent).reverse('abc123', sender.address));
    })

    it('should fail if agent dispute for sender', async function(){
        await escrow.connect(sender).fund('abc123',1000000000000000n,
        {value:100000000000000n});

        //await escrow.connect(receiver).reverse('abc123', receiver.address);
        await expectRevert(escrow.connect(agent).dispute('abc123', sender.address));
    })


    it('should fail if agent sign release for recipient', async function(){
        await escrow.connect(sender).fund('abc123',1000000000000000n,
        {value:100000000000000n});

        //await escrow.connect(receiver).reverse('abc123', receiver.address);
        await expectRevert(escrow.connect(agent).release('abc123', receiver.address));
    })

    it('should fail if agent sign reverse for recipient', async function(){
        await escrow.connect(sender).fund('abc123',1000000000000000n,
        {value:100000000000000n});

        //await escrow.connect(receiver).reverse('abc123', receiver.address);
        await expectRevert(escrow.connect(agent).reverse('abc123', receiver.address));
    })

    it('should fail if agent dispute for recipient', async function(){
        await escrow.connect(sender).fund('abc123',1000000000000000n,
        {value:100000000000000n});

        //await escrow.connect(receiver).reverse('abc123', receiver.address);
        await expectRevert(escrow.connect(agent).dispute('abc123', receiver.address));
    })



    it('should fail if random user sign release for sender', async function(){
        await escrow.connect(sender).fund('abc123',1000000000000000n,
        {value:100000000000000n});

        //await escrow.connect(receiver).reverse('abc123', receiver.address);
        await expectRevert(escrow.connect(randomUser).release('abc123', receiver.address));
    })

    it('should fail if random user sign reverse for sender', async function(){
        await escrow.connect(sender).fund('abc123',1000000000000000n,
        {value:100000000000000n});

        //await escrow.connect(receiver).reverse('abc123', receiver.address);
        await expectRevert(escrow.connect(randomUser).reverse('abc123', receiver.address));
    })

    it('should fail if random user dispute for sender', async function(){
        await escrow.connect(sender).fund('abc123',1000000000000000n,
        {value:100000000000000n});

        //await escrow.connect(receiver).reverse('abc123', receiver.address);
        await expectRevert(escrow.connect(randomUser).dispute('abc123', receiver.address));
    })



    it('should fail if random user sign release for recipient', async function(){
        await escrow.connect(sender).fund('abc123',1000000000000000n,
        {value:100000000000000n});

        //await escrow.connect(receiver).reverse('abc123', receiver.address);
        await expectRevert(escrow.connect(randomUser).release('abc123', receiver.address));
    })

    it('should fail if random user sign reverse for recipient', async function(){
        await escrow.connect(sender).fund('abc123',1000000000000000n,
        {value:100000000000000n});

        //await escrow.connect(receiver).reverse('abc123', receiver.address);
        await expectRevert(escrow.connect(randomUser).reverse('abc123', receiver.address));
    })

    it('should fail if random user dispute for recipient', async function(){
        await escrow.connect(sender).fund('abc123',1000000000000000n,
        {value:100000000000000n});

        //await escrow.connect(receiver).reverse('abc123', receiver.address);
        await expectRevert(escrow.connect(randomUser).dispute('abc123', receiver.address));
    })

    
    it('escrow finalized if sender release and recipient release', async function(){
        await escrow.connect(sender).fund('abc123',1000000000000000n,
        {value:100000000000000n});

        await escrow.connect(sender).release('abc123',sender.address);
        await expect(escrow.connect(receiver).release('abc123',receiver.address)).to
        .emit(escrow, 'Finalized').withArgs('abc123',receiver.address);

    })

    it('escrow finalized if recipient release and sender release', async function(){
        await escrow.connect(sender).fund('abc123',1000000000000000n,
        {value:100000000000000n});

        await escrow.connect(receiver).release('abc123',receiver.address);
        await expect(escrow.connect(sender).release('abc123',sender.address)).to
        .emit(escrow, 'Finalized').withArgs('abc123',receiver.address);
    })

    it('escrow disputed if sender release and recipient reverse', async function(){
        await escrow.connect(sender).fund('abc123',1000000000000000n,
        {value:100000000000000n});

        await escrow.connect(sender).release('abc123',sender.address);
        await expect(escrow.connect(receiver).reverse('abc123',receiver.address)).to
        .emit(escrow, 'Disputed').withArgs('abc123',receiver.address);

    })

    it('escrow disputed if recipient release and sender reverse', async function(){
        await escrow.connect(sender).fund('abc123',1000000000000000n,
        {value:100000000000000n});

        await escrow.connect(receiver).release('abc123',receiver.address);
        await expect(escrow.connect(sender).reverse('abc123',sender.address)).to
        .emit(escrow, 'Disputed').withArgs('abc123',sender.address);
    })

    it('escrow disputed if sender reverse and recipient release', async function(){
        await escrow.connect(sender).fund('abc123',1000000000000000n,
        {value:100000000000000n});

        await escrow.connect(sender).reverse('abc123',sender.address);
        await expect(escrow.connect(receiver).release('abc123',receiver.address)).to
        .emit(escrow, 'Disputed').withArgs('abc123',receiver.address);

    })

    it('escrow disputed if recipient reverse and sender release', async function(){
        await escrow.connect(sender).fund('abc123',1000000000000000n,
        {value:100000000000000n});

        await escrow.connect(receiver).reverse('abc123',receiver.address);
        await expect(escrow.connect(sender).release('abc123',sender.address)).to
        .emit(escrow, 'Disputed').withArgs('abc123',sender.address);
    })

    it('escrow finalized and reverted if sender reverse and recipient reverse', async function(){
        await escrow.connect(sender).fund('abc123',1000000000000000n,
        {value:100000000000000n});

        await escrow.connect(sender).reverse('abc123',sender.address);
        await expect(escrow.connect(receiver).reverse('abc123',receiver.address)).to
        .emit(escrow, 'Finalized').withArgs('abc123',sender.address);
    })

    it('escrow finalized and reverted if recipient reverse and sender reverse', async function(){
        await escrow.connect(sender).fund('abc123',1000000000000000n,
        {value:100000000000000n});

        await escrow.connect(receiver).reverse('abc123',receiver.address);
        await expect(escrow.connect(sender).reverse('abc123',sender.address)).to
        .emit(escrow, 'Finalized').withArgs('abc123',sender.address);
    })

    it('disputed escrow released if agent release', async function() {
        await escrow.connect(sender).fund('abc123',1000000000000000n,
        {value:100000000000000n});

        await escrow.connect(sender).reverse('abc123',sender.address);
        await escrow.connect(receiver).release('abc123',receiver.address);
        
        await expect(escrow.connect(agent).release('abc123',receiver.address)).to.emit(
            escrow,
            'Finalized'
        ).withArgs('abc123',receiver.address);
    })

    it('disputed escrow reverted if agent reverse', async function() {
        await escrow.connect(sender).fund('abc123',1000000000000000n,
        {value:100000000000000n});

        await escrow.connect(sender).reverse('abc123',sender.address);
        await escrow.connect(receiver).release('abc123',receiver.address);
        
        await expect(escrow.connect(agent).reverse('abc123',sender.address)).to.emit(
            escrow,
            'Finalized'
        ).withArgs('abc123',sender.address);
    })

    it('receiver should be able to fully withdraw released fund', async function(){
        await escrow.connect(sender).fund('abc123',1000000000000000n,
        {value:100000000000000n});

        await escrow.connect(sender).release('abc123',sender.address);
        await escrow.connect(receiver).release('abc123',receiver.address);

        await expect(escrow.connect(receiver).withdraw('abc123',1000000000000000n)).to.emit(
            escrow,
            'Withdrawn'
        ).withArgs('abc123',receiver,1000000000000000n);
    })

    it('receiver should be able to partially withdraw release fund', async function(){
        await escrow.connect(sender).fund('abc123',1000000000000000n,
        {value:100000000000000n});

        await escrow.connect(sender).release('abc123',sender.address);
        await escrow.connect(receiver).release('abc123',receiver.address);

        await expect(escrow.connect(receiver).withdraw('abc123',500000000000000n)).to.emit(
            escrow,
            'Withdrawn'
        ).withArgs('abc123',receiver,500000000000000n);
    })

    it('receiver can withdraw partly multiple times', async function(){
        await escrow.connect(sender).fund('abc123',1000000000000000n,
        {value:100000000000000n});

        await escrow.connect(sender).release('abc123',sender.address);
        await escrow.connect(receiver).release('abc123',receiver.address);


        escrow.connect(receiver).withdraw('abc123',200000000000000n);
        escrow.connect(receiver).withdraw('abc123',100000000000000n);
        escrow.connect(receiver).withdraw('abc123',300000000000000n);
        await expect(escrow.connect(receiver).withdraw('abc123',500000000000000n)).to.emit(
            escrow,
            'Withdrawn'
        ).withArgs('abc123',receiver,500000000000000n);
    })

    it('should fail if receiver try to withdraw what is more than funded', async function(){
        await escrow.connect(sender).fund('abc123',1000000000000000n,
        {value:100000000000000n});

        await escrow.connect(sender).release('abc123',sender.address);
        await escrow.connect(receiver).release('abc123',receiver.address);

        await expectRevert(escrow.connect(receiver).withdraw('abc123',100000000000000000n));
    })

    it('should fail if receiver try to withdraw more than funded in smaller amounts multiple time', async function(){
        await escrow.connect(sender).fund('abc123',1000000000000000n,
        {value:100000000000000n});

        await escrow.connect(sender).release('abc123',sender.address);
        await escrow.connect(receiver).release('abc123',receiver.address);


        escrow.connect(receiver).withdraw('abc123',200000000000000n);
        escrow.connect(receiver).withdraw('abc123',100000000000000n);
        escrow.connect(receiver).withdraw('abc123',300000000000000n);
        await expectRevert(escrow.connect(receiver).withdraw('abc123',600000000000000n));
    })

    it('sender can withdraw full funds if reverted', async function(){
        await escrow.connect(sender).fund('abc123',1000000000000000n,
        {value:100000000000000n});

        await escrow.connect(sender).reverse('abc123',sender.address);
        await escrow.connect(receiver).reverse('abc123',receiver.address);

        await expect(escrow.connect(sender).withdraw('abc123',1000000000000000n)).to.emit(
            escrow,
            'Withdrawn'
        ).withArgs('abc123',sender,1000000000000000n);
    })


})