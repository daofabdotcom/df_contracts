const { expect } = require('chai');
const { ethers, web3 } = require ('hardhat');
//const {expectRevert} = require('@openzeppelin/test-helpers');


describe("DFGlobalEscrow_Unit_Tests_ERC20", function(){
    let deployer, sender, receiver, agent;
    let ZeroAddress = '0x0000000000000000000000000000000000000000';
    let escrow;
    let erc20;

    beforeEach(async function(){
        [deployer,sender,receiver,agent, randomUser] = await ethers.getSigners();
        // console.log("deployer", deployer.address);
        // console.log("sender",sender.address);
        // console.log("receiver",receiver.address);
        // console.log("agent",agent.address);
        // console.log("randomUser",randomUser.address);

        let mockERC20Contract = await ethers.getContractFactory("ERC20Mock");
        erc20 = await mockERC20Contract.connect(deployer).deploy("Mock ERC20","MRC20",sender.address,"1000000000000000000000000000000");
        await erc20.deployed();
        

        let escrowContract = await ethers.getContractFactory("DFGlobalEscrow");
        escrow = await escrowContract.connect(deployer).deploy();
        //console.log("escrow = ", escrow.address);
        await escrow.deployed();

        await escrow.connect(deployer).createEscrow(
            "abc1234",
            sender.address,
            receiver.address,
            agent.address,
            1,
            erc20.address,
            1000000000000000n
        );


        await erc20.connect(sender).approve(escrow.address,1000000000000000000000n)
    })

    it('sender cannot sign release before escrow is funded', async function(){
        await expect(escrow.connect(sender)
        .release('abc1234',sender.address)).to.be.revertedWith("Escrow is not funded");
    })

    it('sender cannot sign revert before escrow is funded', async function(){
        await expect(escrow.connect(sender)
        .reverse('abc1234',sender.address)).to.be.revertedWith("Escrow is not funded");
    })

    it('sender cannot dispute before escrow is funded', async function(){
        await expect(escrow.connect(sender)
        .dispute('abc1234',sender.address)).to.be.revertedWith('Escrow is not funded')
    })

    it('recipient cannot sign release before escrow is funded', async function(){
        await expect(escrow.connect(sender)
        .release('abc1234',receiver.address)).to.be.revertedWith('Escrow is not funded')
    })

    it('recipient cannot sign revert before escrow is funded', async function(){
        await expect(escrow.connect(sender)
        .reverse('abc1234',receiver.address)).to.be.revertedWith('Escrow is not funded')
    })
    
    it('recipient cannot dispute before escrow is funded', async function(){
        await expect(escrow.connect(sender)
        .dispute('abc1234',sender.address)).to.be.revertedWith('Escrow is not funded')
    })

    it('agent cannot sign release before escrow is funded', async function(){
        await expect(escrow.connect(sender)
        .release('abc1234',agent.address)).to.be.revertedWith('Escrow is not funded')
    })

    it('agent cannot sign revert before escrow is funded', async function(){
        await expect(escrow.connect(sender)
        .reverse('abc1234',agent.address)).to.be.revertedWith('Escrow is not funded')
    })

    it('receiver cannot fund the escrow', async function(){
        await expect(escrow.connect(receiver).fund('abc1234',100000000000000n)).to.be.revertedWith("Sender must be Escrow's owner or delegator");
    })

    it('agent cannot fund the escrow', async function(){
        await expect(escrow.connect(agent).fund('abc1234',100000000000000n)).to.be.revertedWith("Sender must be Escrow's owner or delegator");
    })

    it('should fail if a random address try to fund the escrow', async function(){
        await expect(escrow.connect(randomUser).fund('abc1234',100000000000000n)).to.be.revertedWith("Sender must be Escrow's owner or delegator");
    })


    it('only sender can fund the escrow with exact amount', async function() {
        //await erc20.connect(sender).approve(escrow.address,1000000000000000000000n)
        await expect(escrow.connect(sender).fund(
            'abc1234',1000000000000000n)
            )
            .to.emit(escrow,'Funded').withArgs('abc1234',sender.address,1000000000000000n);
    })

    it('should fail if funded with higher amount', async function() {
        //await erc20.connect(sender).approve(escrow.address,1000000000000000000000n)
        await expect(escrow.connect(sender).fund(
            'abc1234',100000000000000000n)
            ).to.be.revertedWith("Must fund for exact ERC20-amount in Escrow")
    })

    it('should fail if funded with lower amount', async function() {
        //await erc20.connect(sender).approve(escrow.address,1000000000000000000000n);
        await expect(escrow.connect(sender).fund(
            'abc1234',10000000000000000n)
        ).to.be.revertedWith("Must fund for exact ERC20-amount in Escrow")
    })

    it('should fail if funded twice/multiple times', async function(){
        await expect(escrow.connect(sender).fund(
            'abc1234',1000000000000000n)
            )
            .to.emit(escrow,'Funded').withArgs('abc1234',sender.address,1000000000000000n);

            //await escrow.connect(sender).fund('abc1234',100000000000000n);
        await expect(escrow.connect(sender).fund(
            'abc1234',1000000000000000n)
            ).to.be.revertedWith("Escrow is already funded");
    })

    it('sender can sign release if escrow is funded', async function(){
        await escrow.connect(sender).fund('abc1234',1000000000000000n);
        await expect(escrow.connect(sender).release('abc1234', sender.address)).
        to.emit(escrow,'Signature').withArgs('abc1234',sender.address,2);
    })

    it('recipient can sign release if escrow is funded', async function(){
        await escrow.connect(sender).fund('abc1234',1000000000000000n);
        await expect(escrow.connect(receiver).release('abc1234', receiver.address)).
        to.emit(escrow,'Signature').withArgs('abc1234',receiver.address,2);
    })

    // it('should fail if agent try to sign release without dispute in funded escrow', async function(){
    //     await escrow.connect(sender).fund('abc1234',1000000000000000n,
    //     {value:100000000000000n});
    //     await expect(escrow.connect(agent).release('abc1234',agent.address)).to.be.revertedWith("");
    // })

    it('sender can sign revert if escrow is funded', async function(){
        await escrow.connect(sender).fund('abc1234',1000000000000000n);
        await expect(escrow.connect(sender).reverse('abc1234', sender.address)).
        to.emit(escrow,'Signature').withArgs('abc1234',sender.address,1);
    })

    it('recipient can sign revert if escrow is funded', async function(){
        await escrow.connect(sender).fund('abc1234',1000000000000000n);
        await expect(escrow.connect(receiver).reverse('abc1234', receiver.address)).
        to.emit(escrow,'Signature').withArgs('abc1234',receiver.address,1);
    })

    // it('should fail if agent try to sign revert without dispute in funded escrow', async function(){
    //     await escrow.connect(sender).fund('abc1234',1000000000000000n,
    //     {value:100000000000000n});
    //     await expect(escrow.connect(agent).release('abc1234',agent.address)).to.be.reverted;
    // })

    it('should fail if sender sign release twice', async function(){
        await escrow.connect(sender).fund('abc1234',1000000000000000n);

        await escrow.connect(sender).release('abc1234', sender.address);
        await expect(escrow.connect(sender).release('abc1234', sender.address)).to.be.revertedWith("Party has already signed");
    })

    it('should fail if recipient sign release twice', async function(){
        await escrow.connect(sender).fund('abc1234',1000000000000000n);

        await escrow.connect(receiver).release('abc1234', receiver.address);
        await expect(escrow.connect(receiver).release('abc1234', receiver.address)).to.be.revertedWith("Party has already signed");
    })
    
    it('should fail if sender sign reverse twice', async function(){
        await escrow.connect(sender).fund('abc1234',1000000000000000n);

        await escrow.connect(sender).reverse('abc1234', sender.address);
        await expect(escrow.connect(sender).reverse('abc1234', sender.address)).to.be.revertedWith("Party has already signed");
    })

    it('should fail if recipient sign reverse twice', async function(){
        await escrow.connect(sender).fund('abc1234',1000000000000000n);

        await escrow.connect(receiver).reverse('abc1234', receiver.address);
        await expect(escrow.connect(receiver).reverse('abc1234', receiver.address)).to.be.revertedWith("Party has already signed");
    })

    it('should fail if sender try to replace release with reverse', async function(){
        await escrow.connect(sender).fund('abc1234',1000000000000000n);

        await escrow.connect(sender).release('abc1234', sender.address);
        await expect(escrow.connect(sender).reverse('abc1234', sender.address)).to.be.revertedWith("Party has already signed");
    })

    it('should fail if recipient try to replace release with reverse', async function(){
        await escrow.connect(sender).fund('abc1234',1000000000000000n);

        await escrow.connect(receiver).release('abc1234', receiver.address);
        await expect(escrow.connect(receiver).reverse('abc1234', receiver.address)).to.be.revertedWith("Party has already signed");
    })

    it('should fail if sender try to replace reverse with release', async function(){
        await escrow.connect(sender).fund('abc1234',1000000000000000n);

        await escrow.connect(sender).reverse('abc1234', sender.address);
        await expect(escrow.connect(sender).release('abc1234', sender.address)).to.be.revertedWith("Party has already signed");
    })

    it('should fail if recipient try to replace reverse with release', async function(){
        await escrow.connect(sender).fund('abc1234',1000000000000000n);

        await escrow.connect(receiver).reverse('abc1234', receiver.address);
        await expect(escrow.connect(receiver).release('abc1234', receiver.address)).to.be.revertedWith("Party has already signed");
    })

    it('sender can dispute after funding', async function() {
        await escrow.connect(sender).fund('abc1234',1000000000000000n);

        await expect(escrow.connect(sender).dispute('abc1234', sender.address)).to.emit(
            escrow,
            'Disputed'
        ).withArgs('abc1234',sender.address);
    })

    it('receiver can dispute after funding', async function() {
        await escrow.connect(sender).fund('abc1234',1000000000000000n);

        await expect(escrow.connect(receiver).dispute('abc1234', receiver.address)).to.emit(
            escrow,
            'Disputed'
        ).withArgs('abc1234',receiver.address);
    })

    it('should fail if sender sign release for recipient', async function(){
        await escrow.connect(sender).fund('abc1234',1000000000000000n);

        //await escrow.connect(receiver).reverse('abc1234', receiver.address);
        await expect(escrow.connect(sender).release('abc1234', receiver.address)).to.be.revertedWith("Party must be same as msg.sender");
    })

    it('should fail if sender sign reverse for recipient', async function(){
        await escrow.connect(sender).fund('abc1234',1000000000000000n);

        //await escrow.connect(receiver).reverse('abc1234', receiver.address);
        await expect(escrow.connect(sender).reverse('abc1234', receiver.address)).to.be.revertedWith("Party must be same as msg.sender");
    })

    it('should fail if sender dispute for recipient', async function(){
        await escrow.connect(sender).fund('abc1234',1000000000000000n);

        //await escrow.connect(receiver).reverse('abc1234', receiver.address);
        await expect(escrow.connect(sender).dispute('abc1234', receiver.address)).to.be.revertedWith("Party must be same as msg.sender");
    })

    it('should fail if receiver sign release for sender', async function(){
        await escrow.connect(sender).fund('abc1234',1000000000000000n);

        //await escrow.connect(receiver).reverse('abc1234', receiver.address);
        await expect(escrow.connect(receiver).release('abc1234', sender.address)).to.be.revertedWith("Party must be same as msg.sender");
    })

    it('should fail if receiver sign reverse for sender', async function(){
        await escrow.connect(sender).fund('abc1234',1000000000000000n);

        //await escrow.connect(receiver).reverse('abc1234', receiver.address);
        await expect(escrow.connect(receiver).reverse('abc1234', sender.address)).to.be.revertedWith("Party must be same as msg.sender");
    })

    it('should fail if receiver dispute for sender', async function(){
        await escrow.connect(sender).fund('abc1234',1000000000000000n);

        //await escrow.connect(receiver).reverse('abc1234', receiver.address);
        await expect(escrow.connect(receiver).dispute('abc1234', sender.address)).to.be.revertedWith("Party must be same as msg.sender");
    })



    // it('should fail if agent sign release for sender', async function(){
    //     await escrow.connect(sender).fund('abc1234',1000000000000000n,
    //     {value:100000000000000n});

    //     //await escrow.connect(receiver).reverse('abc1234', receiver.address);
    //     await expectRevert(escrow.connect(agent).release('abc1234', sender.address));
    // })

    // it('should fail if agent sign reverse for sender', async function(){
    //     await escrow.connect(sender).fund('abc1234',1000000000000000n,
    //     {value:100000000000000n});

    //     //await escrow.connect(receiver).reverse('abc1234', receiver.address);
    //     await expectRevert(escrow.connect(agent).reverse('abc1234', sender.address));
    // })

    // it('should fail if agent dispute for sender', async function(){
    //     await escrow.connect(sender).fund('abc1234',1000000000000000n,
    //     {value:100000000000000n});

    //     //await escrow.connect(receiver).reverse('abc1234', receiver.address);
    //     await expectRevert(escrow.connect(agent).dispute('abc1234', sender.address));
    // })


    // it('should fail if agent sign release for recipient', async function(){
    //     await escrow.connect(sender).fund('abc1234',1000000000000000n,
    //     {value:100000000000000n});

    //     //await escrow.connect(receiver).reverse('abc1234', receiver.address);
    //     await expectRevert(escrow.connect(agent).release('abc1234', receiver.address));
    // })

    // it('should fail if agent sign reverse for recipient', async function(){
    //     await escrow.connect(sender).fund('abc1234',1000000000000000n,
    //     {value:100000000000000n});

    //     //await escrow.connect(receiver).reverse('abc1234', receiver.address);
    //     await expectRevert(escrow.connect(agent).reverse('abc1234', receiver.address));
    // })

    // it('should fail if agent dispute for recipient', async function(){
    //     await escrow.connect(sender).fund('abc1234',1000000000000000n,
    //     {value:100000000000000n});

    //     //await escrow.connect(receiver).reverse('abc1234', receiver.address);
    //     await expectRevert(escrow.connect(agent).dispute('abc1234', receiver.address));
    // })



    it('should fail if random user sign release for sender', async function(){
        await escrow.connect(sender).fund('abc1234',1000000000000000n);

        //await escrow.connect(receiver).reverse('abc1234', receiver.address);
        await expect(escrow.connect(randomUser).release('abc1234', sender.address)).to.be.revertedWith("Sender must be Escrow's Owner or Recipient or agent or delegator");
    })

    it('should fail if random user sign reverse for sender', async function(){
        await escrow.connect(sender).fund('abc1234',1000000000000000n);

        //await escrow.connect(receiver).reverse('abc1234', receiver.address);
        await expect(escrow.connect(randomUser).reverse('abc1234', sender.address)).to.be.revertedWith("Sender must be Escrow's Owner or Recipient or agent or delegator");
    })

    it('should fail if random user dispute for sender', async function(){
        await escrow.connect(sender).fund('abc1234',1000000000000000n);

        //await escrow.connect(receiver).reverse('abc1234', receiver.address);
        await expect(escrow.connect(randomUser).dispute('abc1234', sender.address)).to.be.revertedWith("Sender must be Escrow's Owner or Recipient or delegator");
    })



    it('should fail if random user sign release for recipient', async function(){
        await escrow.connect(sender).fund('abc1234',1000000000000000n);

        //await escrow.connect(receiver).reverse('abc1234', receiver.address);
        await expect(escrow.connect(randomUser).release('abc1234', receiver.address)).to.be.revertedWith("Sender must be Escrow's Owner or Recipient or agent or delegator");
    })

    it('should fail if random user sign reverse for recipient', async function(){
        await escrow.connect(sender).fund('abc1234',1000000000000000n);

        //await escrow.connect(receiver).reverse('abc1234', receiver.address);
        await expect(escrow.connect(randomUser).reverse('abc1234', receiver.address)).to.be.revertedWith("Sender must be Escrow's Owner or Recipient or agent or delegator");
    })

    it('should fail if random user dispute for recipient', async function(){
        await escrow.connect(sender).fund('abc1234',1000000000000000n);

        //await escrow.connect(receiver).reverse('abc1234', receiver.address);
        await expect(escrow.connect(randomUser).dispute('abc1234', receiver.address)).to.be.revertedWith("Sender must be Escrow's Owner or Recipient or delegator");
    })

   
    it('escrow finalized if sender release and recipient release', async function(){
        await escrow.connect(sender).fund('abc1234',1000000000000000n);

        await escrow.connect(sender).release('abc1234',sender.address);
        await expect(escrow.connect(receiver).release('abc1234',receiver.address)).to
        .emit(escrow, 'Finalized').withArgs('abc1234',receiver.address);

    })

    it('escrow finalized if recipient release and sender release', async function(){
        await escrow.connect(sender).fund('abc1234',1000000000000000n);

        await escrow.connect(receiver).release('abc1234',receiver.address);
        await expect(escrow.connect(sender).release('abc1234',sender.address)).to
        .emit(escrow, 'Finalized').withArgs('abc1234',receiver.address);
    })

    it('escrow disputed if sender release and recipient reverse', async function(){
        await escrow.connect(sender).fund('abc1234',1000000000000000n);

        await escrow.connect(sender).release('abc1234',sender.address);
        await expect(escrow.connect(receiver).reverse('abc1234',receiver.address)).to
        .emit(escrow, 'Disputed').withArgs('abc1234',receiver.address);

    })

    it('escrow disputed if recipient release and sender reverse', async function(){
        await escrow.connect(sender).fund('abc1234',1000000000000000n);

        await escrow.connect(receiver).release('abc1234',receiver.address);
        await expect(escrow.connect(sender).reverse('abc1234',sender.address)).to
        .emit(escrow, 'Disputed').withArgs('abc1234',sender.address);
    })

    it('escrow disputed if sender reverse and recipient release', async function(){
        await escrow.connect(sender).fund('abc1234',1000000000000000n);

        await escrow.connect(sender).reverse('abc1234',sender.address);
        await expect(escrow.connect(receiver).release('abc1234',receiver.address)).to
        .emit(escrow, 'Disputed').withArgs('abc1234',receiver.address);

    })

    it('escrow disputed if recipient reverse and sender release', async function(){
        await escrow.connect(sender).fund('abc1234',1000000000000000n);

        await escrow.connect(receiver).reverse('abc1234',receiver.address);
        await expect(escrow.connect(sender).release('abc1234',sender.address)).to
        .emit(escrow, 'Disputed').withArgs('abc1234',sender.address);
    })

    it('escrow finalized and reverted if sender reverse and recipient reverse', async function(){
        await escrow.connect(sender).fund('abc1234',1000000000000000n);

        await escrow.connect(sender).reverse('abc1234',sender.address);
        await expect(escrow.connect(receiver).reverse('abc1234',receiver.address)).to
        .emit(escrow, 'Finalized').withArgs('abc1234',sender.address);
    })

    it('escrow finalized and reverted if recipient reverse and sender reverse', async function(){
        await escrow.connect(sender).fund('abc1234',1000000000000000n);

        await escrow.connect(receiver).reverse('abc1234',receiver.address);
        await expect(escrow.connect(sender).reverse('abc1234',sender.address)).to
        .emit(escrow, 'Finalized').withArgs('abc1234',sender.address);
    })

    it('disputed escrow released if agent release', async function() {
        await escrow.connect(sender).fund('abc1234',1000000000000000n);

        await escrow.connect(sender).reverse('abc1234',sender.address);
        await escrow.connect(receiver).release('abc1234',receiver.address);
        
        await expect(escrow.connect(agent).release('abc1234',agent.address)).to.emit(
            escrow,
            'Finalized'
        ).withArgs('abc1234',receiver.address);
    })

    it('disputed escrow reverted if agent reverse', async function() {
        await escrow.connect(sender).fund('abc1234',1000000000000000n);

        await escrow.connect(sender).reverse('abc1234',sender.address);
        await escrow.connect(receiver).release('abc1234',receiver.address);
        
        await expect(escrow.connect(agent).reverse('abc1234',agent.address)).to.emit(
            escrow,
            'Finalized'
        ).withArgs('abc1234',sender.address);
    })

    it('receiver should be able to fully withdraw released fund', async function(){
        await escrow.connect(sender).fund('abc1234',1000000000000000n);

        await escrow.connect(sender).release('abc1234',sender.address);
        await escrow.connect(receiver).release('abc1234',receiver.address);

        await expect(escrow.connect(receiver).withdraw('abc1234',1000000000000000n)).to.emit(
            escrow,
            'Withdrawn'
        ).withArgs('abc1234',receiver.address,1000000000000000n);
    })

    it('receiver should be able to partially withdraw release fund', async function(){
        await escrow.connect(sender).fund('abc1234',1000000000000000n);

        await escrow.connect(sender).release('abc1234',sender.address);
        await escrow.connect(receiver).release('abc1234',receiver.address);

        await expect(escrow.connect(receiver).withdraw('abc1234',50000000000000n)).to.emit(
            escrow,
            'Withdrawn'
        ).withArgs('abc1234',receiver.address,50000000000000n);
    })

    it('receiver can withdraw partly multiple times', async function(){
        await escrow.connect(sender).fund('abc1234',1000000000000000n);

        await escrow.connect(sender).release('abc1234',sender.address);
        await escrow.connect(receiver).release('abc1234',receiver.address);


        escrow.connect(receiver).withdraw('abc1234',200000000000000n);
        escrow.connect(receiver).withdraw('abc1234',100000000000000n);
        escrow.connect(receiver).withdraw('abc1234',200000000000000n);
        await expect(escrow.connect(receiver).withdraw('abc1234',500000000000000n)).to.emit(
            escrow,
            'Withdrawn'
        ).withArgs('abc1234',receiver.address,500000000000000n);
    })

    it('should fail if receiver try to withdraw what is more than funded', async function(){
        await escrow.connect(sender).fund('abc1234',1000000000000000n);

        await escrow.connect(sender).release('abc1234',sender.address);
        await escrow.connect(receiver).release('abc1234',receiver.address);

        await expect(escrow.connect(receiver).withdraw('abc1234',5000000000000000n)).to.be.revertedWith("Cannot withdraw more than the deposit");
    })

    it('should fail if receiver try to withdraw more than funded in smaller amounts multiple time', async function(){
        await escrow.connect(sender).fund('abc1234',1000000000000000n);

        await escrow.connect(sender).release('abc1234',sender.address);
        await escrow.connect(receiver).release('abc1234',receiver.address);


        escrow.connect(receiver).withdraw('abc1234',200000000000000n);
        escrow.connect(receiver).withdraw('abc1234',100000000000000n);
        escrow.connect(receiver).withdraw('abc1234',300000000000000n);
        await expect(escrow.connect(receiver).withdraw('abc1234',600000000000000n)).to.be.revertedWith("Cannot withdraw more than the deposit");
    })

    it('sender can withdraw full funds if reverted', async function(){
        await escrow.connect(sender).fund('abc1234',1000000000000000n);

        await escrow.connect(sender).reverse('abc1234',sender.address);
        await escrow.connect(receiver).reverse('abc1234',receiver.address);

        await expect(escrow.connect(sender).withdraw('abc1234',1000000000000000n)).to.emit(
            escrow,
            'Withdrawn'
        ).withArgs('abc1234',sender.address,1000000000000000n);
    })
   
})