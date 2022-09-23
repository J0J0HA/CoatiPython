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
putWorm         = __jsfunc(__js.window.coati.putWorm)
removeWorm      = __jsfunc(__js.window.coati.removeWorm)
onWorm          = __jsfunc(__js.window.coati.onWorm)
ballFront       = __jsfunc(__js.window.coati.ballFront)
stoneFront      = __jsfunc(__js.window.coati.stoneFront)
stoneLeft       = __jsfunc(__js.window.coati.stoneLeft)
stoneRight      = __jsfunc(__js.window.coati.stoneRight)
