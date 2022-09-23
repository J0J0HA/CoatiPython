import js as __js

def __jsfunc(func):
    def __wrapper():
        result = func()
        __js.saveState()
        return result
    return __wrapper;

move            = __jsfunc(__js.window.coati.move)
turnLeft        = __jsfunc(__js.window.coati.turnLeft)
turnRight       = __jsfunc(__js.window.coati.turnRight)
putLeaf         = __jsfunc(__js.window.coati.putWorm)
removeLeaf      = __jsfunc(__js.window.coati.removeWorm)
onLeaf          = __jsfunc(__js.window.coati.onWorm)
mushroomFront   = __jsfunc(__js.window.coati.ballFront)
treeFront       = __jsfunc(__js.window.coati.stoneFront)
treeLeft        = __jsfunc(__js.window.coati.stoneLeft)
treeRight       = __jsfunc(__js.window.coati.stoneRight)
