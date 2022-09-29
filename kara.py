import js as __js
import pyodide as __py

class KaraError(BaseException): pass
class MovedTowardsStone(KaraError): pass
class NoWormThere(KaraError): pass
class WormAlreadyPlaced(KaraError): pass
class MovedMultipleBalls(KaraError): pass


__errors = {
    "towardsstone": MovedTowardsStone("Can't move! There is a tree in the way!"),
    "noworm": NoWormThere("No leaf to remove"),
    "aworm": WormAlreadyPlaced("There is already a leaf"),
    "multipleballs": MovedMultipleBalls("Can't move multiple mushrooms at the same time!")
}

def __jsfunc(func):
    def __wrapper():
        try:
            result = func()
        except __py.JsException as e:
            try:
                raise __errors[str(e).removeprefix("Error: ")]
            except KeyError as a:
                raise KaraError("This Error is not meant to be thrown! Please report it (the entire message) on GitHub! (Go to Welcome Guide and click the desired link)") from e
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
