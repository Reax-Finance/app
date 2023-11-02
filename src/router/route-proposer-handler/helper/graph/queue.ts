class _Node {
    val: any;
    next: number | null;
    constructor(val: any, next = null) {
        this.val = val;
        this.next = next;
    }
}

class LinkedList {
    head: any;
    tail: any;
    size: number;
    constructor() {
        this.head = null;
        this.tail = null;
        this.size = 0;
    }

    appendElement(val: any) {

        let node = new _Node(val);

        if (this.head == null) {
            this.head = node;
            this.tail = node;
        } else {

            this.tail.next = node;
            this.tail = node;
        }

        this.size++
    }

    removeElement() {
        if (this.size == 0) throw Error('Queue is empty')
        else {

            let temp = this.head;
            this.head = this.head.next;
            temp.next = null;
            
            if (this.size == 1) {
                this.tail = null;
            }
            this.size--;
            return temp.val
        }
    }


}


export class Queue{
    list: LinkedList;
    constructor(){
         this.list = new LinkedList()
    }
 
    enQueue(val: any){               // adding element in a que
        this.list.appendElement(val)
    }

    deQueue(){
        return this.list.removeElement()
    }

    get getSize(){
        return this.list.size;
    }

    frontElement(){
        return this.list.head.val
    }

    isEmpty(){
    return this.list.size === 0; 
    }
}


