import { Mint, Burn, Transfer } from '../generated/FiatTokenV1/FiatTokenV1'
import {
  User,
  Minter,
  UserCounter,
  MinterCounter,
  TransferCounter,
  TotalSupply
} from '../generated/schema'
import { BigInt } from '@graphprotocol/graph-ts'

export function handleMint(event: Mint): void {
  let day = (event.block.timestamp.div(BigInt.fromI32(60 * 60 * 24)))
  let minter = Minter.load(event.params.to.toHex())
  if (minter == null) {
    // Minter
    minter = new Minter(event.params.to.toHex())
    minter.address = event.params.to.toHex()
    minter.totalMinted = BigInt.fromI32(0)
    minter.totalBurned = BigInt.fromI32(0)

    event.params

    // MinterCounter
    let minterCounter = MinterCounter.load('singleton')
    if (minterCounter == null) {
      minterCounter = new MinterCounter('singleton')
      minterCounter.count = 1
    } else {
      minterCounter.count = minterCounter.count + 1
    }
    minterCounter.save()
  }
  minter.totalMinted = minter.totalMinted.plus(event.params.value)
  minter.save()

  let totalSupply = TotalSupply.load('singleton')
  if (totalSupply == null) {
    totalSupply = new TotalSupply('singleton')
    totalSupply.supply = BigInt.fromI32(0)
    totalSupply.minted = BigInt.fromI32(0)
    totalSupply.burned = BigInt.fromI32(0)
  }
  totalSupply.supply = totalSupply.supply.plus(event.params.value)
  totalSupply.minted = totalSupply.minted.plus(event.params.value)
  totalSupply.save()
  totalSupply.id = day.toString()
  totalSupply.save()
}

export function handleBurn(event: Burn): void {
  let day = (event.block.timestamp.div(BigInt.fromI32(60 * 60 * 24)))
  let minter = Minter.load(event.params.burner.toHex())
  if (minter == null) {
    minter = new Minter(event.params.burner.toHex())
    minter.address = event.params.burner.toHex()
    minter.totalMinted = BigInt.fromI32(0)
    minter.totalBurned = BigInt.fromI32(0)

    // MinterCounter
    let minterCounter = MinterCounter.load('singleton')
    if (minterCounter == null) {
      minterCounter = new MinterCounter('singleton')
      minterCounter.count = 1
    } else {
      minterCounter.count = minterCounter.count + 1
    }
    minterCounter.save()
    minterCounter.id = day.toString()
    minterCounter.save()
  }
  minter.totalBurned = minter.totalBurned.plus(event.params.value)
  minter.save()

  let totalSupply = TotalSupply.load('singleton')
  if (totalSupply == null) {
    totalSupply = new TotalSupply('singleton')
    totalSupply.supply = BigInt.fromI32(0)
    totalSupply.minted = BigInt.fromI32(0)
    totalSupply.burned = BigInt.fromI32(0)
  }
  totalSupply.supply = totalSupply.supply.minus(event.params.value)
  totalSupply.burned = totalSupply.burned.plus(event.params.value)
  totalSupply.save()
  totalSupply.id = day.toString()
  totalSupply.save()
}

export function handleTransfer(event: Transfer): void {
  let day = (event.block.timestamp.div(BigInt.fromI32(60 * 60 * 24)))

  let userFrom = User.load(event.params.from.toHex())
  if (userFrom == null) {
    userFrom = newUser(event.params.from.toHex(), event.params.from.toHex());
  }
  userFrom.balance = userFrom.balance.minus(event.params.value)
  userFrom.transactionCount = userFrom.transactionCount + 1
  userFrom.save()

  let userTo = User.load(event.params.to.toHex())
  if (userTo == null) {
    userTo = newUser(event.params.to.toHex(), event.params.to.toHex());

    // UserCounter
    let userCounter = UserCounter.load('singleton')
    if (userCounter == null) {
      userCounter = new UserCounter('singleton')
      userCounter.count = 1
    } else {
      userCounter.count = userCounter.count + 1
    }
    userCounter.save()
    userCounter.id = day.toString()
    userCounter.save()
  }
  userTo.balance = userTo.balance.plus(event.params.value)
  userTo.transactionCount = userTo.transactionCount + 1
  userTo.save()

  // Transfer counter total and historical
  let transferCounter = TransferCounter.load('singleton')
  if (transferCounter == null) {
    transferCounter = new TransferCounter('singleton')
    transferCounter.count = 0
    transferCounter.totalTransferred = BigInt.fromI32(0)
  }
  transferCounter.count = transferCounter.count + 1
  transferCounter.totalTransferred = transferCounter.totalTransferred.plus(event.params.value)
  transferCounter.save()
  transferCounter.id = day.toString()
  transferCounter.save()
}

function newUser(id: string, address: string): User {
  let user = new User(id);
  user.address = address
  user.balance = BigInt.fromI32(0)
  user.transactionCount = 0
  return user
}
